use std::io::Write;

use crossterm::{
    cursor, execute,
    terminal::{self, ClearType},
};

use crate::push::{PushStatus, Pusher};
use crate::types::PlayerState;
use crate::util::{fmt_bytes, fmt_elapsed, fmt_time};

pub const DIVIDER: &str = "────────────────────────────────────────────────────";

pub fn redraw(lines: &[String]) {
    let mut stdout = std::io::stdout();
    execute!(
        stdout,
        terminal::Clear(ClearType::All),
        cursor::MoveTo(0, 0)
    )
    .ok();
    println!("  Magic Sentry  ·  WarCraft III Game Data Tracker");
    println!("  {DIVIDER}");
    println!();
    for line in lines {
        println!("  {line}");
    }
    stdout.flush().ok();
}

pub fn fmt_push_status(status: &PushStatus) -> String {
    match status {
        PushStatus::Never => "waiting for first push...".to_string(),
        PushStatus::Ok(at, wire, raw) => format!(
            "ok  ({} ago)  ·  {} wire  /  {} raw",
            fmt_elapsed(at.elapsed()),
            fmt_bytes(*wire),
            fmt_bytes(*raw),
        ),
        PushStatus::Err(msg, at) => format!("FAILED {}  ({})", fmt_elapsed(at.elapsed()), msg),
    }
}

#[allow(clippy::too_many_arguments)]
pub fn build_game_lines(
    map_name: &str,
    game_name: &str,
    time_ms: u64,
    output_file: &str,
    pusher: Option<&Pusher>,
    authorized_as: Option<&str>,
    endpoint: Option<&str>,
    session_bytes: usize,
    players: &[PlayerState],
    has_unit_data: bool,
    game_over: bool,
    stale_ticks: u32,
    ticks: u32,
    sample_interval_ms: u64,
) -> Vec<String> {
    let mut lines: Vec<String> = Vec::new();
    lines.push(format!("Map         {map_name}"));
    lines.push(format!("Game        {game_name}"));
    lines.push(format!("Time        {}", fmt_time(time_ms)));
    lines.push(format!("Sampling    {} ms", sample_interval_ms));
    lines.push(format!("Output      {output_file}"));
    if let Some(p) = pusher {
        let user = authorized_as.unwrap_or("anonymous");
        lines.push(format!("Endpoint    {}", endpoint.unwrap_or("")));
        lines.push(format!("User        {user}"));
        lines.push(format!(
            "Push        {}  (seq {})",
            fmt_push_status(&p.status),
            p.seq()
        ));
        lines.push(format!(
            "Game sent   {}  wire  /  {}  raw",
            fmt_bytes(p.total_wire_bytes),
            fmt_bytes(p.total_raw_bytes),
        ));
        lines.push(format!(
            "Session     {}",
            fmt_bytes(session_bytes + p.total_wire_bytes)
        ));
    }
    lines.push(String::new());
    lines.push(format!(
        "{:<20} {:<10} {:>6}  {:>7}  {:>7}  {:>4}",
        "Player", "Race", "Gold", "Lumber", "Food", "APM"
    ));
    lines.push(DIVIDER.to_string());
    for p in players {
        if let Some(s) = p.samples.last() {
            lines.push(format!(
                "{:<20} {:<10} {:>6}  {:>7}  {:>3}/{:<3}  {:>4}",
                p.name, p.race, s.gold, s.lumber, s.food_used, s.food_cap, s.apm
            ));
        }
    }
    if game_over {
        lines.push(String::new());
        lines.push("Game over.".to_string());
    }
    if stale_ticks >= 10 {
        lines.push(String::new());
        lines.push("Game appears stalled. Press [p] to stop recording.".to_string());
    }
    if !has_unit_data {
        lines.push(String::new());
        lines.push(format!("Tick {}  ·  waiting for hero/unit data...", ticks));
    }
    lines
}
