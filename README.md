# Magic Sentry — WarCraft III Game Data Tracker

Magic Sentry is a Windows CLI tool that reads live game data from Warcraft III via the [War3StatsObserver](https://github.com/garlic-hub/warcraft3statsobserverrs) shared memory API and writes per-game JSON snapshots to disk.

## Features

- Connects automatically when Warcraft III is running
- Waits for a game to start, then begins tracking player stats every second
- Displays a live terminal dashboard (resources, food, APM per player)
- Writes a JSON snapshot every 30 seconds and a final snapshot on game over
- Releases the shared memory handle cleanly after each game and reconnects for the next one

## Requirements

- Windows (uses Win32 shared memory)
- Warcraft III

## Usage

Download the latest `magic-sentry.exe` from [Releases](../../releases) and run it in a terminal while Warcraft III is open.

```
magic-sentry.exe
```

Output files are written to the current directory as `game_<MapName>.json`.

## Visualizing output

Upload the JSON file to the **Magic Sentry Data Visualizer** tab at:
https://pbug90.github.io/wc3-replay-parser-web/

## Building from source

```
cargo build --release --target x86_64-pc-windows-msvc
```
