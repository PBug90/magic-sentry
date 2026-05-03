# Magic Sentry CLI

![Magic Sentry](../assets/magicsentry.png)

Windows CLI application that reads live game data from Warcraft III via the shared memory API and streams it to disk and/or a remote HTTP endpoint.

## Requirements

- Windows (uses Win32 shared memory)
- Warcraft III running on the same machine

## Usage

```
magic-sentry.exe
```

The terminal shows live resource, food, and APM stats per player. Press **p** to stop recording the current game early, **Ctrl+C** to exit.

By default the tool only writes local JSON files. To also stream patches to the web server, place a `magic-sentry.toml` next to the executable:

```toml
endpoint = "https://your-server.example.com/api/ingest"
secret   = "your-cli-token"   # token generated in the web UI → Settings
```

With this config, incremental patches are pushed to the endpoint every 10 seconds and on game end.

## Output

### Local file

Each game produces a JSON file in the current working directory:

```
{epoch}-{Player1(Race)}-{Player2(Race)}-{Map}.json
```

Example: `1746300000-Foo(Human)-Bar(Undead)-LostTemple.json`

The file is written every 10 seconds and finalized on game over. It follows the `GameRecord` schema:

```jsonc
{
  "map": "LostTemple",
  "game": "W3Champions #12345",
  "duration_ms": 1200000,
  "players": [
    {
      "name": "Foo",
      "race": "Human",
      "team": 0,
      "result": "Victory",
      "time_in_upkeep_ms": [/* 10 upkeep tiers */],
      "samples": [
        {
          "time_ms": 1000,
          "gold": 500, "gold_mined": 1000, "gold_upkeep_lost": 0,
          "lumber": 200, "lumber_mined": 300, "lumber_upkeep_lost": 0,
          "food_used": 20, "food_cap": 80, "apm": 120,
          "heroes": [{ "name": "Hmkg", "level": 3, "xp": 1800, ... }],
          "units":  [{ "name": "hfoo", "alive": 8, "trained": 10 }]
        }
        // one entry per second of game time
      ],
      "summary": {
        "heroes": [{ "name": "Hmkg", "level": 6, "total_kills": 42, ... }],
        "units":  [{ "name": "hfoo", "trained": 24, "alive": 18, ... }]
      }
    }
  ]
}
```

### HTTP push (incremental patch protocol)

When `endpoint` is configured, the CLI sends `GamePatch` objects via `POST` to the endpoint. Each patch carries only the samples collected since the previous push, keeping individual payloads small regardless of game length.

```jsonc
{
  "game_id": "1746300000-Foo(Human)-Bar(Undead)-LostTemple", // matches filename stem
  "seq": 2,          // 0-based, monotonically increasing — server uses this to detect gaps
  "is_final": false, // true only on game-over or manual stop
  "map": "LostTemple",
  "game": "W3Champions #12345",
  "players": [
    {
      "name": "Foo",
      "race": "Human",
      "team": 0,
      "result": "",           // filled only on final patch
      "new_samples": [ ... ], // samples since previous push
      "summary": null         // populated only on final patch
    }
  ]
}
```

The server is expected to accumulate patches by `game_id` + `seq` order to reconstruct the full record. The `web` application in this repo implements the receiving end.

Push results are shown in the terminal:

```
Endpoint  http://localhost:3000/api/ingest  ·  seq 4  ·  ok  (12s ago)
```

Failed pushes are shown but do not interrupt recording — the local file is always written regardless of network availability.

## Building from source

From the workspace root:

```
cargo build --release --target x86_64-pc-windows-msvc -p magic-sentry
```

The binary is written to `target/x86_64-pc-windows-msvc/release/magic-sentry.exe`.

## Running tests

```
cargo test -p magic-sentry
```

The test suite starts a real `tiny_http` server and exercises the full push cycle, including incremental cursor advancement and error handling for unreachable endpoints.
