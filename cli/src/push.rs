use std::io::Write;
use std::sync::mpsc::{self, Receiver, TryRecvError};
use std::time::Instant;

use crate::types::{GamePatch, PlayerPatch, PlayerState};

// ---------------------------------------------------------------------------
// Pre-flight auth check
// ---------------------------------------------------------------------------

#[derive(serde::Deserialize)]
struct AuthMeResponse {
    user: Option<AuthMeUser>,
}

#[derive(serde::Deserialize)]
struct AuthMeUser {
    display_name: String,
}

/// Derives the scheme+host+port from a full URL.
/// "http://host:3000/api/ingest" → "http://host:3000"
fn base_url(endpoint: &str) -> &str {
    let after_scheme = endpoint.find("://").map(|i| i + 3).unwrap_or(0);
    match endpoint[after_scheme..].find('/') {
        Some(i) => &endpoint[..after_scheme + i],
        None => endpoint,
    }
}

/// POSTs to `{base}/auth/me` and returns:
/// - `Ok(Some(display_name))` — valid user token
/// - `Ok(None)`               — valid static secret (no associated user)
/// - `Err(message)`           — unauthorized or unreachable
pub fn check_auth(endpoint: &str, secret: &str) -> Result<Option<String>, String> {
    let url = format!("{}/auth/token/me", base_url(endpoint));
    let response = ureq::post(&url)
        .set("Authorization", &format!("Bearer {secret}"))
        .send_string("")
        .map_err(|e| match e {
            ureq::Error::Status(401, _) => "invalid token — check your secret".to_string(),
            other => format!("could not reach server: {other}"),
        })?;
    let body: AuthMeResponse = response.into_json().map_err(|e| e.to_string())?;
    Ok(body.user.map(|u| u.display_name))
}

// ---------------------------------------------------------------------------
// Push status — shown in the terminal display
// ---------------------------------------------------------------------------

pub enum PushStatus {
    Never,
    /// Successful push: timestamp, compressed wire bytes, and raw JSON bytes.
    Ok(Instant, usize, usize),
    Err(String, Instant),
}

// ---------------------------------------------------------------------------
// Pusher
// ---------------------------------------------------------------------------

pub struct Pusher {
    endpoint: String,
    game_id: String,
    seq: u32,
    /// Per-player index of the first sample not yet pushed.
    cursors: Vec<usize>,
    pub status: PushStatus,
    pub total_wire_bytes: usize,
    pub total_raw_bytes: usize,
    /// Receives the result of the most recent background POST.
    result_rx: Option<Receiver<Result<(usize, usize), String>>>,
    secret: Option<String>,
}

impl Pusher {
    pub fn seq(&self) -> u32 {
        self.seq
    }

    pub fn new(endpoint: &str, game_id: &str, player_count: usize, secret: Option<String>) -> Self {
        Self {
            endpoint: endpoint.to_string(),
            game_id: game_id.to_string(),
            seq: 0,
            cursors: vec![0; player_count],
            status: PushStatus::Never,
            total_wire_bytes: 0,
            total_raw_bytes: 0,
            result_rx: None,
            secret,
        }
    }

    /// Non-blocking: checks if the background thread from a previous push has
    /// finished and updates `self.status` accordingly. Call once per tick.
    pub fn poll(&mut self) {
        let rx = match self.result_rx.take() {
            Some(rx) => rx,
            None => return,
        };
        match rx.try_recv() {
            Ok(Ok((raw, wire))) => {
                self.total_raw_bytes += raw;
                self.total_wire_bytes += wire;
                self.status = PushStatus::Ok(Instant::now(), wire, raw);
            }
            Ok(Err(e)) => {
                self.status = PushStatus::Err(e, Instant::now());
            }
            Err(TryRecvError::Empty) => {
                // Still in-flight — put the receiver back.
                self.result_rx = Some(rx);
            }
            Err(TryRecvError::Disconnected) => {
                // Thread panicked without sending; treat as error.
                self.status =
                    PushStatus::Err("push thread disconnected".to_string(), Instant::now());
            }
        }
    }

    /// Builds a patch from new samples, advances cursors, and fires a
    /// background POST. Returns immediately; use `poll()` to read the result.
    pub fn push(&mut self, players: &[PlayerState], map: &str, game: &str, is_final: bool) {
        // Collect new samples per player.
        let player_patches: Vec<PlayerPatch> = players
            .iter()
            .enumerate()
            .map(|(i, p)| {
                let cursor = self.cursors.get(i).copied().unwrap_or(0);
                let new_samples = p.samples[cursor..].to_vec();
                PlayerPatch {
                    name: p.name.clone(),
                    race: p.race.clone(),
                    team: p.team,
                    result: if is_final {
                        p.result.clone()
                    } else {
                        String::new()
                    },
                    new_samples,
                    summary: if is_final {
                        Some(p.summary.clone())
                    } else {
                        None
                    },
                }
            })
            .collect();

        // Advance cursors before spawning so the next call never double-sends.
        for (i, p) in players.iter().enumerate() {
            if i < self.cursors.len() {
                self.cursors[i] = p.samples.len();
            }
        }

        let patch = GamePatch {
            game_id: self.game_id.clone(),
            seq: self.seq,
            is_final,
            map: map.to_string(),
            game: game.to_string(),
            players: player_patches,
        };
        self.seq += 1;

        let endpoint = self.endpoint.clone();
        let secret = self.secret.clone();
        let (tx, rx) = mpsc::channel();
        self.result_rx = Some(rx);

        std::thread::spawn(move || {
            let result = post_patch(&endpoint, &patch, secret.as_deref());
            let _ = tx.send(result);
        });
    }
}

// ---------------------------------------------------------------------------
// HTTP POST
// ---------------------------------------------------------------------------

fn post_patch(
    endpoint: &str,
    patch: &GamePatch,
    secret: Option<&str>,
) -> Result<(usize, usize), String> {
    let json = serde_json::to_vec(patch).map_err(|e| e.to_string())?;
    let raw_bytes = json.len();

    let mut compressed = Vec::new();
    {
        let mut encoder = brotli::CompressorWriter::new(&mut compressed, 4096, 4, 20);
        encoder.write_all(&json).map_err(|e| e.to_string())?;
    }
    let wire_bytes = compressed.len();

    let request = ureq::post(endpoint)
        .set("Content-Type", "application/json")
        .set("Content-Encoding", "br");
    let request = match secret {
        Some(s) => request.set("Authorization", &format!("Bearer {s}")),
        None => request,
    };
    request.send_bytes(&compressed).map_err(|e| e.to_string())?;
    Ok((raw_bytes, wire_bytes))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use std::time::Duration;

    use tiny_http::{Response, Server};

    use super::*;
    use crate::types::{PlayerState, PlayerSummary, ResourceSample};

    // --- helpers ---

    fn make_sample(time_ms: u64) -> ResourceSample {
        ResourceSample {
            time_ms,
            gold: 500,
            gold_mined: 1000,
            gold_upkeep_lost: 0,
            lumber: 200,
            lumber_mined: 300,
            lumber_upkeep_lost: 0,
            food_used: 20,
            food_cap: 80,
            apm: 100,
            heroes: vec![],
            units: vec![],
            upgrades: vec![],
        }
    }

    fn make_player(name: &str, race: &str) -> PlayerState {
        PlayerState {
            name: name.to_string(),
            race: race.to_string(),
            team: 0,
            result: String::new(),
            samples: vec![],
            summary: PlayerSummary {
                heroes: vec![],
                units: vec![],
                upgrades: vec![],
            },
        }
    }

    /// Starts a `tiny_http` server on an OS-assigned port and returns its port
    /// along with a channel that receives the decoded body of each incoming request.
    /// Brotli-compressed bodies (`Content-Encoding: br`) are transparently decompressed.
    /// The server thread exits once the `Sender` is dropped (channel disconnected).
    fn start_server() -> (u16, std::sync::mpsc::Receiver<String>) {
        let server = Server::http("127.0.0.1:0").unwrap();
        let port = server.server_addr().to_ip().unwrap().port();
        let (tx, rx) = std::sync::mpsc::channel();

        std::thread::spawn(move || {
            loop {
                match server.recv_timeout(Duration::from_secs(10)) {
                    Ok(Some(mut req)) => {
                        let is_brotli = req
                            .headers()
                            .iter()
                            .any(|h| h.field.equiv("Content-Encoding") && h.value == "br");
                        let mut raw = Vec::new();
                        req.as_reader().read_to_end(&mut raw).unwrap();
                        let body = if is_brotli {
                            let mut out = Vec::new();
                            brotli::BrotliDecompress(&mut raw.as_slice(), &mut out).unwrap();
                            String::from_utf8(out).unwrap()
                        } else {
                            String::from_utf8(raw).unwrap()
                        };
                        req.respond(Response::empty(200)).ok();
                        if tx.send(body).is_err() {
                            break; // all receivers dropped — stop serving
                        }
                    }
                    _ => break,
                }
            }
        });

        (port, rx)
    }

    /// Polls the pusher in a tight loop until the background thread reports back,
    /// timing out after 5 seconds.
    fn wait_for_push(pusher: &mut Pusher) {
        for _ in 0..100 {
            pusher.poll();
            if matches!(pusher.status, PushStatus::Ok(..) | PushStatus::Err(..)) {
                return;
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        panic!("push did not complete within 5 seconds");
    }

    // --- tests ---

    /// A mid-game push sends all samples collected so far and leaves summary null.
    #[test]
    fn mid_game_push_sends_all_initial_samples() {
        let (port, rx) = start_server();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let mut players = vec![make_player("Foo", "Human"), make_player("Bar", "Undead")];
        for t in 1..=5u64 {
            players[0].samples.push(make_sample(t * 1000));
            players[1].samples.push(make_sample(t * 1000));
        }

        let mut pusher = Pusher::new(&url, "game-001", 2, None);
        pusher.push(&players, "LostTemple", "TestGame", false);
        wait_for_push(&mut pusher);

        let body = rx
            .recv_timeout(Duration::from_secs(5))
            .expect("no request received");
        let patch: serde_json::Value = serde_json::from_str(&body).unwrap();

        assert_eq!(patch["game_id"], "game-001");
        assert_eq!(patch["seq"], 0);
        assert_eq!(patch["is_final"], false);
        assert_eq!(patch["map"], "LostTemple");
        assert_eq!(patch["game"], "TestGame");
        assert_eq!(
            patch["players"][0]["new_samples"].as_array().unwrap().len(),
            5
        );
        assert_eq!(
            patch["players"][1]["new_samples"].as_array().unwrap().len(),
            5
        );
        assert!(patch["players"][0]["summary"].is_null());
        assert!(patch["players"][1]["summary"].is_null());
        assert_eq!(patch["players"][0]["result"], "");
    }

    /// A second push only sends samples collected since the first push.
    #[test]
    fn second_push_sends_only_new_samples() {
        let (port, rx) = start_server();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let mut players = vec![make_player("Foo", "Human")];
        for t in 1..=5u64 {
            players[0].samples.push(make_sample(t * 1000));
        }

        let mut pusher = Pusher::new(&url, "game-002", 1, None);

        // First push — 5 samples
        pusher.push(&players, "LostTemple", "TestGame", false);
        wait_for_push(&mut pusher);
        rx.recv_timeout(Duration::from_secs(5)).unwrap(); // consume

        // Add 3 more samples and push again
        for t in 6..=8u64 {
            players[0].samples.push(make_sample(t * 1000));
        }
        pusher.push(&players, "LostTemple", "TestGame", false);
        wait_for_push(&mut pusher);

        let body = rx
            .recv_timeout(Duration::from_secs(5))
            .expect("no second request");
        let patch: serde_json::Value = serde_json::from_str(&body).unwrap();

        assert_eq!(patch["seq"], 1);
        // Only the 3 new samples, not all 8
        assert_eq!(
            patch["players"][0]["new_samples"].as_array().unwrap().len(),
            3
        );
        // Verify the timestamps are the new ones
        assert_eq!(patch["players"][0]["new_samples"][0]["time_ms"], 6000);
        assert_eq!(patch["players"][0]["new_samples"][2]["time_ms"], 8000);
    }

    /// The final push includes result, summary, and is_final=true.
    #[test]
    fn final_push_includes_result_and_summary() {
        let (port, rx) = start_server();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let mut players = vec![make_player("Foo", "Human")];
        players[0].result = "Victory".to_string();
        players[0].samples.push(make_sample(60_000));

        let mut pusher = Pusher::new(&url, "game-003", 1, None);
        pusher.push(&players, "LostTemple", "TestGame", true);
        wait_for_push(&mut pusher);

        let body = rx
            .recv_timeout(Duration::from_secs(5))
            .expect("no request received");
        let patch: serde_json::Value = serde_json::from_str(&body).unwrap();

        assert_eq!(patch["is_final"], true);
        assert_eq!(patch["players"][0]["result"], "Victory");
        assert!(!patch["players"][0]["summary"].is_null());
    }

    /// seq increments on every push, giving the server a monotonic counter.
    #[test]
    fn seq_increments_across_pushes() {
        let (port, rx) = start_server();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let players = vec![make_player("Foo", "Human")];
        let mut pusher = Pusher::new(&url, "game-004", 1, None);

        for expected_seq in 0..3u64 {
            pusher.push(&players, "LostTemple", "TestGame", false);
            wait_for_push(&mut pusher);
            let body = rx.recv_timeout(Duration::from_secs(5)).unwrap();
            let patch: serde_json::Value = serde_json::from_str(&body).unwrap();
            assert_eq!(patch["seq"], expected_seq);
        }
    }

    /// When the endpoint is unreachable the pusher records an error in `status`.
    #[test]
    fn unreachable_endpoint_sets_error_status() {
        // Bind to get a free port, then immediately drop the listener so nothing
        // is listening there when ureq tries to connect.
        let port = {
            let l = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
            l.local_addr().unwrap().port()
        };
        let url = format!("http://127.0.0.1:{port}/ingest");

        let players = vec![make_player("Foo", "Human")];
        let mut pusher = Pusher::new(&url, "game-005", 1, None);
        pusher.push(&players, "LostTemple", "TestGame", false);

        for _ in 0..100 {
            pusher.poll();
            if matches!(pusher.status, PushStatus::Err(..)) {
                return;
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        panic!("expected Err status but push appeared to succeed on a closed port");
    }

    /// When a secret is configured the Authorization header is sent as a Bearer token.
    #[test]
    fn push_sends_bearer_token() {
        let server = Server::http("127.0.0.1:0").unwrap();
        let port = server.server_addr().to_ip().unwrap().port();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let (tx, rx) = std::sync::mpsc::channel::<String>();
        std::thread::spawn(move || {
            if let Ok(Some(req)) = server.recv_timeout(Duration::from_secs(10)) {
                let auth = req
                    .headers()
                    .iter()
                    .find(|h| h.field.equiv("Authorization"))
                    .map(|h| h.value.as_str().to_string())
                    .unwrap_or_default();
                req.respond(Response::empty(200)).ok();
                let _ = tx.send(auth);
            }
        });

        let players = vec![make_player("Foo", "Human")];
        let mut pusher = Pusher::new(&url, "game-006", 1, Some("supersecret".to_string()));
        pusher.push(&players, "LostTemple", "TestGame", false);
        wait_for_push(&mut pusher);

        let auth_header = rx
            .recv_timeout(Duration::from_secs(5))
            .expect("no request received");
        assert_eq!(auth_header, "Bearer supersecret");
    }

    /// Every push sends `Content-Encoding: br` and the body decompresses to valid JSON.
    #[test]
    fn push_uses_brotli_compression() {
        let server = Server::http("127.0.0.1:0").unwrap();
        let port = server.server_addr().to_ip().unwrap().port();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let (tx, rx) = std::sync::mpsc::channel::<(String, Vec<u8>)>();
        std::thread::spawn(move || {
            if let Ok(Some(mut req)) = server.recv_timeout(Duration::from_secs(10)) {
                let encoding = req
                    .headers()
                    .iter()
                    .find(|h| h.field.equiv("Content-Encoding"))
                    .map(|h| h.value.as_str().to_string())
                    .unwrap_or_default();
                let mut body = Vec::new();
                req.as_reader().read_to_end(&mut body).unwrap();
                req.respond(Response::empty(200)).ok();
                let _ = tx.send((encoding, body));
            }
        });

        let players = vec![make_player("Foo", "Human")];
        let mut pusher = Pusher::new(&url, "game-brotli", 1, None);
        pusher.push(&players, "LostTemple", "TestGame", false);
        wait_for_push(&mut pusher);

        let (encoding, compressed) = rx
            .recv_timeout(Duration::from_secs(5))
            .expect("no request received");

        assert_eq!(encoding, "br", "Content-Encoding header must be 'br'");

        let mut decompressed = Vec::new();
        brotli::BrotliDecompress(&mut compressed.as_slice(), &mut decompressed).unwrap();
        let patch: serde_json::Value = serde_json::from_slice(&decompressed).unwrap();
        assert_eq!(patch["game_id"], "game-brotli");

        let raw_json_len = {
            let mut out = Vec::new();
            brotli::BrotliDecompress(&mut compressed.as_slice(), &mut out).unwrap();
            out.len()
        };

        assert!(
            matches!(pusher.status, PushStatus::Ok(_, wire, _) if wire == compressed.len()),
            "PushStatus wire bytes should match compressed body size"
        );
        assert!(
            matches!(pusher.status, PushStatus::Ok(_, _, raw) if raw == raw_json_len),
            "PushStatus raw bytes should match decompressed JSON size"
        );
        assert_eq!(pusher.total_wire_bytes, compressed.len());
        assert_eq!(pusher.total_raw_bytes, raw_json_len);
    }

    /// Without a secret, no Authorization header is sent.
    #[test]
    fn push_omits_authorization_header_when_no_secret() {
        let server = Server::http("127.0.0.1:0").unwrap();
        let port = server.server_addr().to_ip().unwrap().port();
        let url = format!("http://127.0.0.1:{port}/ingest");

        let (tx, rx) = std::sync::mpsc::channel::<bool>();
        std::thread::spawn(move || {
            if let Ok(Some(req)) = server.recv_timeout(Duration::from_secs(10)) {
                let has_auth = req.headers().iter().any(|h| h.field.equiv("Authorization"));
                req.respond(Response::empty(200)).ok();
                let _ = tx.send(has_auth);
            }
        });

        let players = vec![make_player("Foo", "Human")];
        let mut pusher = Pusher::new(&url, "game-007", 1, None);
        pusher.push(&players, "LostTemple", "TestGame", false);
        wait_for_push(&mut pusher);

        let has_auth = rx
            .recv_timeout(Duration::from_secs(5))
            .expect("no request received");
        assert!(!has_auth);
    }
}
