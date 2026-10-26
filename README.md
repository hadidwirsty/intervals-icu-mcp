# Intervals.icu MCP Server & AI Running Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Protocol-purple.svg)](https://modelcontextprotocol.io/)
[![Tests](https://img.shields.io/badge/Tests-114%20Passed-success.svg)](https://vitest.dev/)

An official-grade **Model Context Protocol (MCP) Server** and **AI Running Coach Intelligence System** for [Intervals.icu](https://intervals.icu), built with dual-engine synergy for [Garmin Connect](https://github.com/hadidwirsty/garmin-connect-mcp).

Empower your AI assistants (**Claude Desktop**, **Antigravity**, **Cursor**, **VS Code Cline / Roo-Code**) to ingest real-time telemetry, evaluate acute & chronic training load (CTL/ATL/TSB/ACWR/Ramp Rate), compute Jack Daniels VDOT & Copeland Norwegian Singles interval matrices, diagnose Aerobic Deficiency Syndrome (ADS) via John Hadd & Uphill Athlete principles, analyze cardiovascular drift, predict race times, calculate carbohydrate fueling protocols, and publish structured workouts directly to your Intervals.icu calendar via Intervals Text DSL.

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
- [🤖 Unified AI Skills & Slash Commands Directory](#-unified-ai-skills--slash-commands-directory)
- [💬 Example Chat Prompts](#-example-chat-prompts)
- [🛠️ Full MCP Tools Reference (39 Tools)](#️-full-mcp-tools-reference-39-tools)
- [🧪 Development & Testing](#-development--testing)
- [📄 License](#-license)

---

## ✨ Key Capabilities

- **🏃 Telemetry & Telemetry Stream Ingestion**: Extract watts, heart rate, cadence, velocity, and interval splits from completed sessions.
- **⚡ Aerobic Decoupling & Cardiac Drift Engine**: Compute Efficiency Factor (EF) $H_1$ vs $H_2$ to detect cardiovascular drift (>5%) or dehydration.
- **🩹 Dual-Engine Recovery & Readiness Scoring**: 0–100% composite score combining TSB, ACWR, Sleep Score, HRV Status, and RHR Spike into Green/Yellow/Red action signals.
- **🔬 John Hadd Physiology & ADS Diagnosis**: 4-tier Aerobic Deficiency Syndrome (ADS) classifier using Uphill Athlete 10% Rule & Horwill's Rule, plus absolute HR training floors ($\le \text{HR}_{\max} - 50\text{ bpm}$).
- **🇳🇴 Norwegian Singles Copeland Matrix**: Deterministic sub-threshold repetition paces and power targets (Fast 3–4m, Medium 4–6m, Long 10–12m) calibrated 5–25 seconds slower than VDOT Threshold.
- **🏆 Race Time Predictor & Tapering Planner**: Jack Daniels VDOT formula + CTL fitness and TSB freshness adjustments + 10–14 day volume reduction schedule.
- **🍌 Race Fueling & Hydration Calculator**: Precise carbohydrate hourly intake targets (dual-source Maltodextrin:Fructose), gel timing schedules, and tropical sweat-rate fluid balancing.
- **📅 Structured Workout Builder & Publisher**: Validate and publish workouts directly to your Intervals.icu calendar using native Intervals Text DSL (`Warmup`, `Main Set Nx`, `Cooldown`).

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
| `INTERVALS_API_BASE_URL` | Optional | Base URL API Intervals.icu (default: `https://intervals.icu/api/v1`). |

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

## 🤖 Unified AI Skills & Slash Commands Directory

This repository includes **6 Production-Grade Agent Skills** in `.agents/skills/` designed for autonomous agent execution:

> 📖 **Comprehensive Usage Guide**: For an in-depth operational timeline of when and how to run each command across macrocycles, mesocycles, and daily routines, see [**`docs/WORKFLOWS-GUIDE.md`**](docs/WORKFLOWS-GUIDE.md).

| Slash Command | Skill File | Description & Methodology |
|---|---|---|
| **`/cek-kesiapan`** | [`SKILL.md`](.agents/skills/cek-kesiapan/SKILL.md) | Dual-Engine physical readiness evaluation (0–100% Green/Yellow/Red) combining Garmin Body Battery & HRV with Intervals.icu CTL/ATL/TSB and 5 fatigue Red Flags. |
| **`/lapor-lari`** | [`SKILL.md`](.agents/skills/lapor-lari/SKILL.md) | Post-run comprehensive evaluation: power telemetry (% CP), Copeland Sub-T intensity compliance, cardiac drift / aerobic decoupling (< 5%), and automated calendar feedback. |
| **`/jadwal-minggu`** | [`SKILL.md`](.agents/skills/jadwal-minggu/SKILL.md) | Weekly training scheduler based on 42-day rolling budget (Faris Salman / Steve Palladino), 3-1 block pattern, and one-click calendar publishing via Intervals Text DSL. |
| **`/kalibrasi-atlet`** | [`SKILL.md`](.agents/skills/kalibrasi-atlet/SKILL.md) | Periodic fitness benchmark (every 4–8 weeks): Jack Daniels VDOT, Copeland interval matrix, John Hadd absolute HR zones, ADS diagnosis, and Garmin Zone 2 audit. |
| **`/panduan-kekuatan`** | [`SKILL.md`](.agents/skills/panduan-kekuatan/SKILL.md) | Functional strength guide (22–25 min) based on Stuart McGill Big 3 spinal protection and Running Anatomy kinetic chain strengthening (Soleus, Hamstrings, Hip Flexors). |
| **`/strategi-lomba`** | [`SKILL.md`](.agents/skills/strategi-lomba/SKILL.md) | Comprehensive race preparation: A/B/C Race priority hierarchy, A/B/C tapering schedules, Critical Power (% CP) split pacing, and carbohydrate/hydration protocols. |

---

## 💬 Example Chat Prompts

Here are examples of how you can chat with your AI Running Coach:

### 1. Daily Morning Readiness Check
> *"`/cek-kesiapan` — Check my Garmin Body Battery, sleep data, and Intervals.icu fatigue load for today's session."*

### 2. Post-Run Telemetry Evaluation
> *"`/lapor-lari` — Analyze my latest morning interval session. Check my sub-threshold power compliance and aerobic decoupling."*

### 3. Weekly Schedule Generation
> *"`/jadwal-minggu` — Plan my training for next week using the 42-day rolling budget and publish the sessions to my Intervals.icu calendar."*

### 4. Periodic Calibration
> *"`/kalibrasi-atlet 5k 24:15` — Recalibrate my VDOT, Copeland interval cards, and John Hadd heart rate zones based on my latest time-trial."*

---

## 🛠️ Full MCP Tools Reference (39 Tools)

The server exposes **39 specialized tools** across 10 functional domains:

### 🏃 1. Activities & Streams (6 tools)
- `get_activities`: Fetch activities within a date range (`oldest`, `newest`, `type`).
- `get_activity_details`: Retrieve full telemetry, metrics, and athlete physiological values for an activity ID.
- `get_activity_intervals`: Extract lap and work/rest interval breakdowns.
- `get_activity_streams`: Access raw time-series stream data (`watts`, `heartrate`, `cadence`, `velocity_smooth`, `altitude`).
- `get_activity_messages`: Read activity comments and notes.
- `add_activity_message`: Post coaching feedback directly to an activity.

### 👤 2. Athlete Biometrics & Zones (2 tools)
- `get_athlete_profile`: Retrieve athlete profile (FTP/CP, LTHR, Max HR, weight, resting HR).
- `get_training_zones`: Access power, heart rate, and pace training zone boundaries.

### 🧮 3. Calculator & Matrix (3 tools)
- `calculate_vdot`: Compute Jack Daniels VDOT & VO₂max from race or time-trial results.
- `calculate_pace_zones`: Compute 5 pace training zones (Easy, Marathon, Threshold, Interval, Repetition).
- `calculate_nsa_matrix`: Generate Norwegian Singles Copeland interval matrix (Fast, Medium, Long) with target paces and power.

### 🔬 4. Physiology & Endurance Intelligence (10 tools)
- `predict_race_time`: Predict race finish time and pace (5K, 10K, HM, FM, or custom distance) from VDOT with CTL/TSB adjustments.
- `calculate_taper_plan`: Generate structured tapering schedule (A/B/C Taper) for peak freshness.
- `analyze_cardiac_drift`: Compute Efficiency Factor (EF) and Aerobic Decoupling % from raw telemetry streams.
- `calculate_readiness_score`: Compute composite recovery score (0–100%, Green/Yellow/Red) combining TSB, ACWR, Sleep, HRV, and RHR.
- `calculate_race_fueling`: Compute carbohydrate intake targets (g/h), gel schedules, and hydration limits.
- `diagnose_aerobic_base`: Diagnose Aerobic Deficiency Syndrome (ADS) via Uphill Athlete 10% Rule & Horwill's Rule.
- `calculate_hadd_zones`: Calculate John Hadd absolute HR training zones and Sub-T baseline.
- `estimate_aerobic_threshold`: Estimate Aerobic Threshold (AeT / VT1) from Max HR and drift telemetry.

### ⚖️ 5. Training Load & Periodization (2 tools)
- `analyze_training_load`: Compute ACWR (`ATL/CTL`), classify TSB readiness zones, and evaluate ramp rate injury risk.
- `calculate_weekly_budget`: Calculate safe weekly training distance and duration allocation based on 42-day rolling history.

### 📅 6. Calendar & Structured Events (8 tools)
- `get_events`: Retrieve calendar items (planned workouts, notes, races) in a date range.
- `get_event_by_id`: Get detailed event data by ID.
- `delete_event`: Remove calendar events by ID.
- `add_or_update_planned_workout`: Create or update planned workout events.
- `add_or_update_note`: Add text notes to calendar dates.
- `get_workout_library`: Search workout template library.
- `get_workout_by_id`: Get workout template details.
- `create_running_workout`: Validate and publish structured running workouts to Intervals.icu calendar using Text DSL.

### ⚙️ 7. Custom Items (5 tools)
- `get_custom_items`: List custom charts, fields, or interval fields.
- `get_custom_item_by_id`: Retrieve specific custom item.
- `create_custom_item`: Create a new custom item.
- `update_custom_item`: Update custom item metadata.
- `delete_custom_item`: Remove a custom item.

### 👟 8. Gear (1 tool)
- `get_gear_list`: List registered running shoes and gear with accumulated mileage (cached 30m).

### 📈 9. Power Curves (1 tool)
- `get_athlete_power_curves`: Fetch running power duration curves (cached 60m).

### 💚 10. Wellness & Fitness Time-Series (2 tools)
- `get_wellness_data`: Retrieve daily wellness entries (sleep score, HRV, resting HR, fatigue, soreness, weight).
- `get_fitness_chart`: Retrieve time-series fitness data (`ctl`, `atl`, `tsb`, `rampRate`, `eftp`).

---

## 🧪 Development & Testing

Run the full unit test suite:

```bash
# Run Vitest unit tests (114 tests)
pnpm test

# Build TypeScript
pnpm run build

# Watch mode during development
pnpm exec vitest
```

Includes **114 unit tests across 22 test files** covering API client auto-retry on HTTP 429, LRU TTL caching, Jack Daniels VDOT math, Copeland interval matrix, John Hadd physiology & ADS diagnostic engine, race prediction, cardiac drift analysis, recovery scoring, race fueling, and workout DSL validation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © Muhammad Hadid Wiransetyo.
