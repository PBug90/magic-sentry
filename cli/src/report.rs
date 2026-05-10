// cfg(test) stubs avoid requiring the web build just to run `cargo test`.
#[cfg(not(test))]
const BUNDLE: &str = include_str!("../../web/dist/standalone/report.js");
#[cfg(test)]
const BUNDLE: &str = "/* test stub */";

#[cfg(not(test))]
const STYLE: &str = include_str!("../../web/dist/standalone/style.css");
#[cfg(test)]
const STYLE: &str = "body{}";

pub fn write_report(
    html_path: &str,
    map_name: &str,
    game_name: &str,
    players: &[crate::types::PlayerState],
) {
    use crate::types::GameState;

    let duration_ms = players
        .iter()
        .flat_map(|p| p.samples.last())
        .map(|s| s.time_ms)
        .max()
        .unwrap_or(0);

    let state = GameState {
        map: map_name.to_string(),
        game: game_name.to_string(),
        duration_ms,
        players: players.to_vec(),
    };

    let json = match serde_json::to_string(&state) {
        Ok(j) => j,
        Err(_) => return,
    };

    let html = format!(
        concat!(
            "<!DOCTYPE html>\n",
            "<html><head><meta charset=\"utf-8\">",
            "<title>{map} \u{2014} Magic Sentry</title>",
            "<style>{style}</style></head>\n",
            "<body style=\"margin:0;background:#0d0d14\">",
            "<div id=\"root\"></div>\n",
            "<script>window.__GAME_DATA__={json};</script>\n",
            "<script>{bundle}</script>\n",
            "</body></html>",
        ),
        map = html_escape(map_name),
        style = STYLE,
        json = json,
        bundle = BUNDLE,
    );

    let _ = std::fs::write(html_path, html);
}

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{PlayerState, PlayerSummary};

    fn make_player(name: &str) -> PlayerState {
        PlayerState {
            name: name.to_string(),
            race: "Human".to_string(),
            team: 0,
            result: "Victory".to_string(),
            samples: vec![],
            summary: PlayerSummary {
                heroes: vec![],
                units: vec![],
                upgrades: vec![],
            },
        }
    }

    #[test]
    fn write_report_produces_valid_html() {
        let players = vec![make_player("Back2War"), make_player("Grubby")];
        let tmp = std::env::temp_dir().join("ms_test_report.html");
        write_report(
            tmp.to_str().unwrap(),
            "TwistedMeadows",
            "TestGame",
            &players,
        );

        let content = std::fs::read_to_string(&tmp).unwrap();
        assert!(content.contains("<!DOCTYPE html>"), "missing doctype");
        assert!(content.contains("<style>"), "missing style tag");
        assert!(
            content.contains("window.__GAME_DATA__="),
            "missing data script"
        );
        assert!(
            content.contains("TwistedMeadows"),
            "missing map name in title"
        );
        assert!(
            content.contains("\"Back2War\""),
            "missing player name in JSON"
        );
        assert!(content.contains("/* test stub */"), "missing bundle");

        let _ = std::fs::remove_file(tmp);
    }

    #[test]
    fn html_escape_handles_special_chars() {
        assert_eq!(html_escape("A&B"), "A&amp;B");
        assert_eq!(html_escape("<script>"), "&lt;script&gt;");
        assert_eq!(html_escape("say \"hi\""), "say &quot;hi&quot;");
        assert_eq!(html_escape("normal"), "normal");
    }
}
