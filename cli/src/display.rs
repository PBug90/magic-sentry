use std::io::Write;

use crossterm::{
    cursor, execute,
    terminal::{self, ClearType},
};

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
