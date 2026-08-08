# Intervals.icu MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

An official-grade **Model Context Protocol (MCP) Server** for [Intervals.icu](https://intervals.icu). This server empowers AI assistants (Claude Desktop, Antigravity, Cursor, etc.) to read endurance training data, analyze physiological metrics, calculate Jack Daniels VDOT & pace zones, estimate ACWR & weekly budgets, and post structured workouts directly to your Intervals.icu calendar.

---

## ✨ Features & Tools Reference

The server exposes 15+ rich MCP tools categorized by functionality:

### 🏃 1. Activities & Workouts
- **`get_activities`**: Fetch activity history within a date range (`oldest`, `newest`).
- **`get_activity_details`**: Retrieve full telemetry & metrics for a specific activity ID.
- **`get_activity_intervals`**: Extract lap and work/rest interval breakdowns.
- **`get_activity_streams`**: Access raw stream data (watts, heart rate, cadence, velocity, altitude).
- **`get_activity_messages`**: Read comments & coach notes on an activity.
- **`add_activity_message`**: Post comments/coaching notes on an activity.

### 👤 2. Athlete & Training Zones
- **`get_athlete_profile`**: Retrieve athlete biometrics (FTP, LTHR, Max HR, weight, resting HR).
- **`get_training_zones`**: Access power, heart rate, and pace training zone boundaries.

### 🧮 3. Physiology & Running Calculators (Offline)
- **`calculate_vdot`**: Compute Jack Daniels VDOT & VO₂max estimate from race/tempo result.
- **`calculate_pace_zones`**: Compute 5 running training pace zones (Easy, Marathon, Threshold, Interval, Repetition) in `MM:SS/km`.

### ⚖️ 4. Training Load & ACWR Analytics (Offline)
- **`analyze_training_load`**: Compute **ACWR** (*Acute:Chronic Workload Ratio* = `ATL/CTL`), classify **TSB Readiness Zones** (*Transition, Fresh, Grey Zone, Optimal, High Risk*), and evaluate **Ramp Rate Risk**.
- **`calculate_weekly_budget`**: Calculate safe **Weekly Training Budget** (Total Volume, Long Run Max 30–35%, Quality/Interval Max 15–20%, Easy Run 45–55%) based on 42d avg load/distance (CTL) and target ramp rate (+5%).

### 📅 5. Calendar & Structured Workout Builder
- **`get_events`**: Retrieve calendar items (planned workouts, notes, races) in a date range.
- **`get_event_by_id`**: Get detailed event data by ID.
- **`create_running_workout`**: **Structured Workout Builder** — Publish structured workouts to the calendar using Intervals.icu Text DSL (Warmup, Main Set Nx, Cooldown).
- **`add_or_update_planned_workout`**: Create or update planned workout events.
- **`add_or_update_note`**: Add text notes to calendar dates.
- **`delete_event`**: Remove calendar events by ID.
- **`get_workout_library`**: Search template workout library.
- **`get_workout_by_id`**: Get single workout template details.

### 🚴 6. Gear & Power Curves
- **`get_gear_list`**: List registered bikes, shoes, and equipment with mileage (cached 30m).
- **`get_athlete_power_curves`**: Fetch power duration curves (cached 60m).

### 💚 7. Wellness & Fitness Time-Series
- **`get_wellness_data`**: Retrieve daily wellness entries (sleep, HRV, fatigue, soreness, weight).
- **`get_fitness_chart`**: Retrieve time-series fitness data (`ctl`, `atl`, `tsb`, `rampRate`, `eftp`).

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js >= 18.0.0
- pnpm / npm / yarn
- An Intervals.icu API Key (Settings > Developer > API Key)

### Installation & Build

```bash
git clone https://github.com/hadidwirsty/intervals-icu-mcp.git
cd intervals-icu-mcp
pnpm install
pnpm run build
```

---

## ⚙️ Configuration

Set environment variables in your environment or MCP config:

| Variable | Required | Description |
|----------|----------|-------------|
| `INTERVALS_API_KEY` | Recommended | Your Intervals.icu API Key. Can also be passed per-call. |
| `INTERVALS_ATHLETE_ID` | Recommended | Default Athlete ID (e.g. `i12345` or `self`). Can be overridden per-call. |

---

## 🔌 MCP Client Setup

### 1. Claude Desktop Configuration
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/path/to/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "your_athlete_id_here"
      }
    }
  }
}
```

### 2. Antigravity / Cursor Configuration
In your MCP settings JSON:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/path/to/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "your_athlete_id_here"
      }
    }
  }
}
```

---

## 🧪 Testing

```bash
pnpm test
```

Includes 48+ unit tests covering utilities, client auto-retry on HTTP 429, LRU TTL caching, Jack Daniels VDOT math, ACWR load analytics, and workout DSL validation.

---

## 📄 License

[MIT](LICENSE) © Muhammad Hadid Wiransetyo
