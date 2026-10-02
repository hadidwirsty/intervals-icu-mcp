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
- **🏆 Race Time Predictor & Tapering Planner**: Jack Daniels VDOT formula + CTL fitness and TSB freshness adjustments + 10–14 day volume reduction schedule with NSA HM reassurance (§5.1).
- **⚖️ Norwegian Singles Weekly Load & Duration Budgeting**: Safe weekly duration allocation (5–9 hours/week, Sub-Threshold 20–25%, Easy & Recovery 75–80%) with strict volume & session quality guardrails (§6.2).
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

## 🤖 AI Skills & Slash Commands Directory

This repository comes pre-loaded with **15 Production-Ready Modern Skills** in `.agents/skills/` (13 interactive slash commands + 2 master foundation knowledge skills) that you can trigger using slash commands (with first-class support for autonomous agent discovery):

> 📖 **Comprehensive Usage Guide**: For an in-depth operational timeline of when and how to run each command across macrocycles, mesocycles, and daily routines, see [**`docs/WORKFLOWS-GUIDE.md`**](docs/WORKFLOWS-GUIDE.md).

| Slash Command | Skill File | Description & Methodology |
|---|---|---|
| **`/plan-week`** | [`SKILL.md`](.agents/skills/plan-week/SKILL.md) | Full 1-week structured plan builder (`E-Q-E-Q-E-Q-LR`) adhering strictly to the 75/25 duration rule with one-click preview & batch publishing to Intervals.icu. |
| **`/run-report`** | [`SKILL.md`](.agents/skills/run-report/SKILL.md) | Post-workout coaching report analyzing watts/HR adherence, interval breakdown, EF, and cardiovascular drift (with extreme heat RPE fallback §4.2). |
| **`/readiness-check`** | [`SKILL.md`](.agents/skills/readiness-check/SKILL.md) | Daily recovery & readiness score evaluation (0–100% Green/Yellow/Red) based on TSB, ACWR, Sleep, RHR spike, and musculoskeletal recovery cross-training protocol (§4.9). |
| **`/cardiac-drift`** | [`SKILL.md`](.agents/skills/cardiac-drift/SKILL.md) | Telemetry stream analysis (HR vs Power/Speed) computing $H_1$ vs $H_2$ Efficiency Factor (EF) and Aerobic Decoupling %. |
| **`/predict-race`** | [`SKILL.md`](.agents/skills/predict-race/SKILL.md) | Estimate 5K, 10K, HM, FM finish times & pace via VDOT with CTL/TSB adjustments + 10–14 day tapering schedule (with HM sweet spot reassurance §5.1 & periodic TT calibration §2.4/§4.3). |
| **`/race-strategy`** | [`SKILL.md`](.agents/skills/race-strategy/SKILL.md) | Comprehensive race day execution plan with split pacing bands (CP-based), EJ Sport Energy Gel (30g carb) intake timing, and tropical sweat rate/hydration management. |
| **`/fitness-status`** | [`SKILL.md`](.agents/skills/fitness-status/SKILL.md) | Complete training load analysis (CTL Fitness, ATL Fatigue, TSB Form, Ramp Rate Risk, and Deload detection). |
| **`/weekly-budget`** | [`SKILL.md`](.agents/skills/weekly-budget/SKILL.md) | Weekly budget & duration allocation (5–9 hours/week) via **Norwegian Singles 75/25 Duration Rule** (Sub-T 20–25%, Easy 75–80%) with strict volume & session quality guardrails (§6.2). |
| **`/calc-nsa`** | [`SKILL.md`](.agents/skills/calc-nsa/SKILL.md) | Personalized Norwegian Singles interval matrix calculator (1m to 15m time-based reps) mapping target paces and watts based on athlete VDOT and CP (§2.2). |
| **`/calc-vdot`** | [`SKILL.md`](.agents/skills/calc-vdot/SKILL.md) | Offline Jack Daniels VDOT and sub-threshold pace training zones calculator from race / time-trial results. |
| **`/check-workout`** | [`SKILL.md`](.agents/skills/check-workout/SKILL.md) | View upcoming scheduled workouts from your Intervals.icu calendar with resolved targets. |
| **`/create-workout`** | [`SKILL.md`](.agents/skills/create-workout/SKILL.md) | Publish structured running workouts to your calendar using Intervals Text DSL (auto-sync to Garmin/Coros) enforcing quality session duration guardrails (§6.2). |
| **`/strength-guide`** | [`SKILL.md`](.agents/skills/strength-guide/SKILL.md) | Functional strength training guide (20-25m) based on Steve Magness framework (Movement Prep, Heavy Neural, Power, Plyos) and McGill Big 3 spinal stability. |

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
> *"`/weekly-budget 6h` — What is my recommended duration split and Sub-Threshold allocation for this week?"*

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
- `calculate_nsa_matrix`: Generate deterministic Norwegian Singles interval matrix (1m to 15m) with target paces and watts from VDOT and CP (§2.2).
- `calculate_vdot`: Compute Jack Daniels VDOT & VO₂max from race/tempo time trial.
- `calculate_pace_zones`: Compute 5 pace training zones (Easy, Marathon, Threshold, Interval, Repetition) in `MM:SS/km`.
- `predict_race_time`: Predict race finish time and pace (5K, 10K, HM, FM, or custom km) from VDOT with CTL fitness and TSB freshness adjustments.
- `calculate_taper_plan`: Generate weekly volume reduction schedule (75% → 50% → 30%) for peak TSB freshness on race day.
- `calculate_race_fueling`: Compute carbohydrate intake (EJ Sport 30g dual-carb gel timing), fluid needs (sweat rate vs safe gastric limit), and CP-based split pacing bands for race day execution.
- `analyze_cardiac_drift`: Compute Efficiency Factor (EF) and Aerobic Decoupling % from raw telemetry streams (`heartrateStream`, `powerOrSpeedStream`).
- `calculate_readiness_score`: Compute unified recovery score (0–100%, Green/Yellow/Red) combining TSB, ACWR, Sleep, HRV, and RHR.

### ⚖️ 4. Training Load & Periodization (Offline)
- `analyze_training_load`: Compute ACWR (`ATL/CTL`), classify TSB readiness zones, and evaluate ramp rate injury risk.
- `calculate_weekly_budget`: Calculate safe weekly training duration allocation (5–9h/week, 20–25% Sub-T, 75–80% Easy, Long Run 75–90m) based on Norwegian Singles principles and guardrails §6.2.

### 📅 5. Calendar & Workout Builder
- `get_events`: Retrieve calendar items (planned workouts, notes, races) in date range.
- `get_event_by_id`: Get detailed event data by ID.
- `generate_weekly_plan`: **Weekly Automation Generator** — Build complete 7-day structured weekly plan (`E-Q-E-Q-E-Q-LR`) with valid Intervals.icu DSL workouts.
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

Includes **86+ unit tests** covering API client auto-retry on HTTP 429, LRU TTL caching, Jack Daniels VDOT math, race prediction, cardiac drift analysis, recovery scoring, ACWR analytics, race fueling & pacing engines, and workout DSL validation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © Muhammad Hadid Wiransetyo.
