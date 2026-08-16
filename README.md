# Intervals.icu MCP Server & AI Running Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Protocol-purple.svg)](https://modelcontextprotocol.io/)
[![Tests](https://img.shields.io/badge/Tests-59%2B%20Passed-success.svg)](https://vitest.dev/)

An official-grade **Model Context Protocol (MCP) Server** and **AI Running Coach Intelligence System** for [Intervals.icu](https://intervals.icu). 

Empower your AI assistants (**Claude Desktop**, **Antigravity**, **Cursor**, **VS Code Cline / Roo-Code**) to read real-time telemetry, evaluate acute & chronic training load (CTL/ATL/TSB/ACWR), compute Jack Daniels VDOT & pace zones, calculate cardiac drift & aerobic decoupling, predict race times, schedule tapering, and publish structured workouts directly to your Intervals.icu calendar.

---

## 📑 Table of Contents
- [✨ Key Capabilities](#-key-capabilities)
- [🚀 3-Minute Quickstart](#-3-minute-quickstart)
- [⚙️ Configuration (API Key & Athlete ID)](#️-configuration)
- [🔌 MCP Client Setup Guides](#-mcp-client-setup-guides)
  - [Claude Desktop](#1-claude-desktop)
  - [Antigravity](#2-antigravity)
  - [Cursor](#3-cursor)
  - [VS Code (Cline / Roo-Code)](#4-vs-code-cline--roo-code)
- [🤖 AI Workflows & Slash Commands Directory](#-ai-workflows--slash-commands-directory)
- [👤 Customizing Your Athlete Profile](#-customizing-your-athlete-profile)
- [💬 Example Chat Prompts](#-example-chat-prompts)
- [🛠️ Full MCP Tools Reference](#️-full-mcp-tools-reference)
- [🧪 Development & Testing](#-development--testing)
- [📄 License](#-license)

---

## ✨ Key Capabilities

- **🏃 Real-time Telemetry & Stream Ingestion**: Extract watts, heart rate, cadence, velocity, and interval splits from completed sessions.
- **⚡ Aerobic Decoupling & Cardiac Drift Engine**: Compute Efficiency Factor (EF) $H_1$ vs $H_2$ to detect cardiovascular drift (>5%) or dehydration.
- **🩹 Unified Recovery & Readiness Scoring**: 0–100% composite score combining TSB, ACWR, Sleep Score, HRV, and RHR Spike into Green/Yellow/Red action signals.
- **🏆 Race Time Predictor & Tapering Planner**: Jack Daniels VDOT formula + CTL fitness and TSB freshness adjustments + 2–3 week volume reduction generator.
- **⚖️ ACWR & Weekly Load Budgeting**: Safe volume progression caps (Long Run 30–35%, Quality 15–20%, Easy 45–55%) based on 42-day rolling baseline.
- **📅 Structured Workout Builder**: Publish workouts to the Intervals.icu calendar using native Intervals Text DSL (`Warmup`, `Main Set Nx`, `Cooldown`).

---

## 🚀 3-Minute Quickstart

### 1. Prerequisites
- **Node.js**: `>= 18.0.0`
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
- **Intervals.icu Account & API Key**

### 2. Clone & Build
```bash
git clone https://github.com/hadidwirsty/intervals-icu-mcp.git
cd intervals-icu-mcp
pnpm install
pnpm run build
```

---

## ⚙️ Configuration

Retrieve your credentials from [Intervals.icu Settings](https://intervals.icu/settings):
1. Scroll down to the **Developer** section.
2. Copy your **API Key** (e.g. `your_api_key_here`).
3. Note your **Athlete ID** (found in settings or profile URL, e.g. `i12345` or use `self`).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INTERVALS_API_KEY` | **Yes** | Your personal Intervals.icu API Key. |
| `INTERVALS_ATHLETE_ID` | Optional | Default Athlete ID (default: `self`). Can be overridden per call. |

---

## 🔌 MCP Client Setup Guides

### 1. Claude Desktop
Add the following to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "YOUR_API_KEY_HERE",
        "INTERVALS_ATHLETE_ID": "self"
      }
    }
  }
}
```

### 2. Antigravity
In your Antigravity MCP settings or `.gemini/config/mcp.json`:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "YOUR_API_KEY_HERE",
        "INTERVALS_ATHLETE_ID": "self"
      }
    }
  }
}
```

### 3. Cursor
In Cursor Settings > Features > MCP Servers or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "YOUR_API_KEY_HERE",
        "INTERVALS_ATHLETE_ID": "self"
      }
    }
  }
}
```

### 4. VS Code (Cline / Roo-Code)
In `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "YOUR_API_KEY_HERE",
        "INTERVALS_ATHLETE_ID": "self"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

---

## 🤖 AI Workflows & Slash Commands Directory

This repository comes pre-loaded with **11 Production-Ready AI Workflows** in `.agents/workflows/` that you can trigger using slash commands:

| Slash Command | File | Description & Usage |
|---|---|---|
| **`/run-report`** | [`run-report.md`](.agents/workflows/run-report.md) | Post-workout coaching report analyzing watts/HR adherence, interval breakdown, and cardiovascular drift. |
| **`/readiness-check`** | [`readiness-check.md`](.agents/workflows/readiness-check.md) | Daily recovery & readiness score evaluation (0–100% Green/Yellow/Red) based on TSB, ACWR, Sleep, and RHR. |
| **`/cardiac-drift`** | [`cardiac-drift.md`](.agents/workflows/cardiac-drift.md) | Telemetry stream analysis (HR vs Power/Speed) computing $H_1$ vs $H_2$ Efficiency Factor (EF) and Aerobic Decoupling %. |
| **`/predict-race`** | [`predict-race.md`](.agents/workflows/predict-race.md) | Estimate 5K, 10K, HM, FM finish times & pace via VDOT with CTL/TSB adjustments + 2–3 week tapering volume schedule. |
| **`/fitness-status`** | [`fitness-status.md`](.agents/workflows/fitness-status.md) | Complete training load analysis (CTL Fitness, ATL Fatigue, TSB Form, Ramp Rate Risk, and Deload detection). |
| **`/weekly-budget`** | [`weekly-budget.md`](.agents/workflows/weekly-budget.md) | Compute weekly safe training budget (Long Run 30–35%, Quality 15–20%, Easy 45–55%) based on 42d rolling load/km. |
| **`/mesocycle-block`** | [`mesocycle-block.md`](.agents/workflows/mesocycle-block.md) | 4-Week 3:1 Mesocycle planning (Build W1-3 (+5%) and Planned Deload W4 (-25%)). |
| **`/backcast-plan`** | [`backcast-plan.md`](.agents/workflows/backcast-plan.md) | Backward planning macrocycle from Target Race Day A (13 Weeks HM, 18 Weeks FM). |
| **`/calc-vdot`** | [`calc-vdot.md`](.agents/workflows/calc-vdot.md) | Offline Jack Daniels VDOT and 5 pace training zones calculator (Easy, Marathon, Threshold, Interval, Repetition). |
| **`/check-workout`** | [`check-workout.md`](.agents/workflows/check-workout.md) | View upcoming scheduled workouts from your Intervals.icu calendar. |
| **`/create-workout`** | [`create-workout.md`](.agents/workflows/create-workout.md) | Publish structured running/cycling workouts to your calendar using Intervals Text DSL. |

---

## 👤 Customizing Your Athlete Profile

To give your AI Assistant accurate coaching context, configure your profile in [`.agents/skills/running-coach-analysis/SKILL.md`](.agents/skills/running-coach-analysis/SKILL.md):

1. **Section 2 (Athlete Profile)**: Fill in your name, age, fallback weight, and target race goals.
2. **Section 3 (Physiological Baseline)**: Provide fallback CP/FTP, LTHR, Max HR, and Resting HR (note: active values are automatically synced dynamically via MCP).
3. **Section 4 (Weekly Structure & Blueprints)**: Define your weekly training frequency, preferred workout sessions (e.g. Subthreshold, VO2Max, Long Run), and specific power/pace targets.

---

## 💬 Example Chat Prompts

Here are examples of how you can chat with your AI Running Coach:

### 1. Daily Post-Run Evaluation
> *"Here is my workout from this morning. Please run `/run-report` on my latest activity. RPE was 6/10, legs felt springy during the 3rd interval."*

### 2. Pre-Workout Readiness Check
> *"`/readiness-check` — Am I well-recovered for today's Subthreshold interval session, or should I cap intensity to Zone 2?"*

### 3. Weekly Volume Allocation
> *"`/weekly-budget distance` — What is my recommended total mileage and Long Run ceiling for this week?"*

### 4. Race Day Prediction & Tapering
> *"`/predict-race` — My active VDOT is 50 and my target Half Marathon race is on 2026-10-15. Give me finish time prediction and 2-week tapering schedule."*

### 5. Schedule a Workout to Calendar
> *"`/create-workout` — Schedule a 50-minute Subthreshold session (Warmup 12m, 6x3m @ 95-98% CP with 1m rest, Cooldown 6m) for tomorrow."*

---

## 🛠️ Full MCP Tools Reference

The server exposes **20+ tools** grouped by category:

### 🏃 1. Activities & Streams
- `get_activities`: Fetch activities within a date range (`oldest`, `newest`, `type`).
- `get_activity_details`: Retrieve full telemetry, metrics, and athlete physiological values for an activity ID.
- `get_activity_intervals`: Extract lap and work/rest interval breakdowns.
- `get_activity_streams`: Access raw time-series stream data (`watts`, `heartrate`, `cadence`, `velocity_smooth`, `altitude`).
- `get_activity_messages`: Read activity comments and notes.
- `add_activity_message`: Post coaching feedback to an activity.

### 👤 2. Athlete Biometrics & Zones
- `get_athlete_profile`: Retrieve athlete profile (FTP, LTHR, Max HR, weight, resting HR).
- `get_training_zones`: Access power, heart rate, and pace training zone boundaries.

### 🧮 3. Physiology & Endurance Intelligence (Offline)
- `calculate_vdot`: Compute Jack Daniels VDOT & VO₂max from race/tempo time trial.
- `calculate_pace_zones`: Compute 5 pace training zones (Easy, Marathon, Threshold, Interval, Repetition) in `MM:SS/km`.
- `predict_race_time`: Predict race finish time and pace (5K, 10K, HM, FM, or custom km) from VDOT with CTL fitness and TSB freshness adjustments.
- `calculate_taper_plan`: Generate weekly volume reduction schedule (75% → 50% → 30%) for peak TSB freshness on race day.
- `analyze_cardiac_drift`: Compute Efficiency Factor (EF) and Aerobic Decoupling % from raw telemetry streams (`heartrateStream`, `powerOrSpeedStream`).
- `calculate_readiness_score`: Compute unified recovery score (0–100%, Green/Yellow/Red) combining TSB, ACWR, Sleep, HRV, and RHR.

### ⚖️ 4. Training Load & Periodization (Offline)
- `analyze_training_load`: Compute ACWR (`ATL/CTL`), classify TSB readiness zones, and evaluate ramp rate injury risk.
- `calculate_weekly_budget`: Calculate safe weekly training budget (Total Volume, Long Run 30–35%, Quality 15–20%, Easy 45–55%) based on 42d rolling average.

### 📅 5. Calendar & Workout Builder
- `get_events`: Retrieve calendar items (planned workouts, notes, races) in date range.
- `get_event_by_id`: Get detailed event data by ID.
- `create_running_workout`: **Structured Workout Builder** — Validate and publish structured workouts to Intervals.icu calendar using Text DSL.
- `add_or_update_planned_workout`: Create or update planned workout events.
- `add_or_update_note`: Add text notes to calendar dates.
- `delete_event`: Remove calendar events by ID.
- `get_workout_library`: Search workout template library.
- `get_workout_by_id`: Get workout template details.

### 🚴 6. Gear & Power Curves
- `get_gear_list`: List registered bikes, shoes, and equipment with mileage (cached 30m).
- `get_athlete_power_curves`: Fetch power duration curves (cached 60m).

### 💚 7. Wellness & Fitness Time-Series
- `get_wellness_data`: Retrieve daily wellness entries (sleep score, HRV, resting HR, fatigue, soreness, weight).
- `get_fitness_chart`: Retrieve time-series fitness data (`ctl`, `atl`, `tsb`, `rampRate`, `eftp`).

---

## 🧪 Development & Testing

Run the full unit test suite:

```bash
# Run Vitest unit tests
pnpm test

# Build TypeScript
pnpm run build

# Watch mode during development
pnpm exec vitest
```

Includes **59+ unit tests** covering API client auto-retry on HTTP 429, LRU TTL caching, Jack Daniels VDOT math, race prediction, cardiac drift analysis, recovery scoring, ACWR analytics, and workout DSL validation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © Muhammad Hadid Wiransetyo.
