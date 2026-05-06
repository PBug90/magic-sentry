use std::time::Duration;

/// Converts a packed WC3 FourCC integer to its 4-character string form.
/// e.g. 1751543663 → "hfoo" (Footman)
pub fn fourcc(id: u32) -> String {
    let bytes = [
        (id >> 24) as u8,
        (id >> 16) as u8,
        (id >> 8) as u8,
        id as u8,
    ];
    String::from_utf8_lossy(&bytes).into_owned()
}

pub fn race_name(r: u8) -> &'static str {
    match r {
        1 => "Human",
        2 => "Orc",
        3 => "Undead",
        4 => "NightElf",
        5 => "Demon",
        _ => "Unknown",
    }
}

pub fn result_name(r: u8) -> &'static str {
    match r {
        0 => "Victory",
        1 => "Defeat",
        2 => "Tie",
        _ => "Neutral",
    }
}

pub fn fmt_time(ms: u64) -> String {
    let s = ms / 1000;
    let m = s / 60;
    let h = m / 60;
    if h > 0 {
        format!("{h}:{:02}:{:02}", m % 60, s % 60)
    } else {
        format!("{m}:{:02}", s % 60)
    }
}

pub fn fmt_bytes(n: usize) -> String {
    if n < 1024 {
        format!("{n} B")
    } else if n < 1024 * 1024 {
        format!("{:.1} KB", n as f64 / 1024.0)
    } else {
        format!("{:.1} MB", n as f64 / (1024.0 * 1024.0))
    }
}

pub fn fmt_elapsed(d: Duration) -> String {
    let s = d.as_secs();
    if s < 60 {
        format!("{s}s")
    } else {
        format!("{}m{:02}s", s / 60, s % 60)
    }
}

/// Replaces any character that is not alphanumeric or `-` with `_`.
pub fn sanitize(s: &str) -> String {
    s.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

/// Builds a stable game ID from player names/races and the map name.
/// Format: `{epoch}-{player_slugs}-{map}` where each slug is `name(race)`.
pub fn build_game_id(players: &[(&str, &str)], map: &str) -> String {
    let epoch = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let player_slugs: String = players
        .iter()
        .map(|(name, race)| format!("{}({})", sanitize(name), sanitize(race)))
        .collect::<Vec<_>>()
        .join("-");
    let safe_map = sanitize(map);
    format!("{epoch}-{player_slugs}-{safe_map}")
}

/// Extracts a human-readable map name from a WC3 map path by returning the
/// longest alphanumeric token (containing at least one letter) in the filename.
///
/// `"Maps\\(4)LostTemple.w3m"`        → `"LostTemple"`
/// `"Maps\\(2)ConcealedHill1.09.w3x"` → `"ConcealedHill1"`
pub fn short_map_name(raw: &str) -> String {
    // Take just the filename (after last path separator).
    let filename = raw.rfind(['/', '\\']).map_or(raw, |i| &raw[i + 1..]);

    // Strip known WC3 file extensions.
    let base = ["w3x", "w3m", "w3n"]
        .iter()
        .find_map(|ext| filename.strip_suffix(&format!(".{ext}")))
        .unwrap_or(filename);

    // Split on non-alphanumeric characters, pick the longest token that
    // contains at least one letter, then strip any remaining digits.
    let name = base
        .split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty() && s.chars().any(|c| c.is_alphabetic()))
        .max_by_key(|s| s.len())
        .unwrap_or(base);

    name.chars().filter(|c| !c.is_numeric()).collect()
}
