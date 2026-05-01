pub fn race_str(r: u8) -> &'static str {
    match r {
        1 => "Human",
        2 => "Orc",
        3 => "Undead",
        4 => "NightElf",
        5 => "Demon",
        _ => "Unknown",
    }
}

pub fn result_str(r: u8) -> &'static str {
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

/// Returns the last alphanumeric word from a WC3 map path, stripping the
/// directory prefix, numeric prefix (e.g. `(4)`), and file extension.
/// `"Maps\\(4)LostTemple.w3m"` → `"LostTemple"`
pub fn short_map_name(raw: &str) -> String {
    let base = raw.rfind('.').map_or(raw, |i| &raw[..i]);
    let end = match base.rfind(|c: char| c.is_alphanumeric()) {
        Some(i) => i + 1,
        None => return raw.to_string(),
    };
    let start = base[..end]
        .rfind(|c: char| !c.is_alphanumeric())
        .map_or(0, |i| i + 1);
    base[start..end].to_string()
}
