# Context Memory — intervals-icu-mcp
_Last updated: 2026-08-17_

## Project Overview
Server **Model Context Protocol (MCP)** untuk Intervals.icu API sekaligus sistem **AI Running Coach Intelligence**. Mengekspos 30+ tools ke AI assistant (Claude Desktop, Antigravity, Cursor, VS Code Cline/Roo-Code) untuk membaca telemetri aktivitas, mengevaluasi beban latihan (CTL/ATL/TSB/ACWR), menghitung VDOT & zona pace Jack Daniels, menganalisis cardiac drift & aerobic decoupling, memprediksi waktu race, menjadwalkan tapering, dan mempublikasikan sesi latihan terstruktur langsung ke kalender Intervals.icu.

## Tech Stack
| Category | Library / Tool | Version |
|----------|---------------|---------|
| Runtime | Node.js | >=18 |
| Language | TypeScript | ^5.7.2 |
| Module System | ES Modules (`"type": "module"`) | — |
| Protocol SDK | @modelcontextprotocol/sdk | ^1.30.0 |
| Validation / Schema | zod | ^4.4.3 |
| Package Manager | pnpm | (via `pnpm-lock.yaml`) |
| Build Tool | TypeScript Compiler (`tsc`) | ^5.7.2 |
| Test Framework | Vitest | ^4.1.10 |
| TypeScript Target | ES2022, NodeNext module resolution | — |

## Architecture
Arsitektur **fungsional + domain-layered** tanpa framework HTTP. Entry point (`src/index.ts`) menginisialisasi MCP server via `stdio` transport dan mendaftarkan seluruh tool handler. Logika dipisah menjadi tiga lapisan:

1. **`src/tools/`** — Handler MCP per-domain (activities, athlete, events, wellness, dll). Setiap file mengekspos satu fungsi `register*Tools(server)`.
2. **`src/utils/`** — Pure functions & helper: kalkulasi fisiologis (VDOT, ACWR, tapering, cardiac drift, readiness), cache TTL in-memory, retry logic, DSL validation.
3. **`src/client.ts`** — HTTP client terpusat ke Intervals.icu REST API (Basic Auth: `API_KEY:<key>`), auto-retry exponential backoff pada error 429 (max 3x), respek `Retry-After` header.

Tidak ada database lokal — server bersifat **stateless**, caching hanya in-memory (volatile).

## Directory Structure
```text
intervals-icu-mcp/
├── .agents/                  # Konfigurasi AI agent (Antigravity)
│   ├── rules/                # Context Memory & rules untuk agent
│   ├── skills/               # Skills coaching analysis & training load
│   └── workflows/            # 11 slash-command workflows siap pakai
├── dist/                     # Output build TypeScript (dihasilkan `tsc`)
├── docs/
│   └── plans/                # 15 implementation plan files (arsip historis)
├── src/                      # Source TypeScript utama
│   ├── tools/                # 10 domain handler files MCP tools
│   │   ├── activities.ts     # get_activities, get_activity_*, add_activity_message
│   │   ├── athlete.ts        # get_athlete_profile, get_training_zones
│   │   ├── calculator.ts     # calculate_vdot, calculate_pace_zones
│   │   ├── customItems.ts    # CRUD custom items (chart, field, zones, dll)
│   │   ├── events.ts         # calendar, planned workouts, workout library, create_running_workout
│   │   ├── gear.ts           # get_gear_list (cache 30m)
│   │   ├── intelligence.ts   # Endurance Intelligence Suite (predict_race_time, calculate_taper_plan, analyze_cardiac_drift, calculate_readiness_score)
│   │   ├── load.ts           # analyze_training_load, calculate_weekly_budget
│   │   ├── powerCurves.ts    # get_athlete_power_curves (cache 60m)
│   │   └── wellness.ts       # get_wellness_data, get_fitness_chart
│   ├── utils/                # 9 pure function / utility modules
│   │   ├── cache.ts          # InMemoryCache class (TTL-based, zero-dep)
│   │   ├── date.ts           # getDefaultDateRange() pure helper
│   │   ├── drift.ts          # analyzeCardiacDrift() — EF & Aerobic Decoupling
│   │   ├── dsl.ts            # validateWorkoutDsl() — Intervals Text DSL validator
│   │   ├── load.ts           # analyzeTrainingLoad, calculateWeeklyBudget, calculateDistanceBudget
│   │   ├── race.ts           # predictRaceTime(), calculateTaperPlan()
│   │   ├── readiness.ts      # calculateReadinessScore() — Green/Yellow/Red
│   │   ├── retry.ts          # calculateRetryDelay() — exponential backoff + jitter
│   │   └── vdot.ts           # calculateVdot(), calculatePaceZones() — Jack Daniels formula
│   ├── client.ts             # HTTP client pusat + resolveAthleteId()
│   ├── config.ts             # Baca & validasi env vars
│   ├── index.ts              # Entry point: init MCP server + register semua tools
│   └── types.ts              # Shared helpers: toToolResult(), errorResult()
├── .env.example              # Template env vars
├── tsconfig.json             # TypeScript config (ES2022, NodeNext, strict)
├── vitest.config.ts          # Vitest config (src/**/*.test.ts)
└── package.json              # Manifest pnpm
```

## Code Conventions
- **File naming**: `camelCase` (contoh: `powerCurves.ts`, `customItems.ts`, `readiness.ts`)
- **Tool registration**: setiap domain file mengekspos satu fungsi `register*Tools(server: McpServer): void`
- **Pattern tool handler**: validasi input (Zod) → resolve athleteId → cek cache → call `intervalsRequest` → return `toToolResult()` atau `errorResult()`
- **Pure utils**: semua logika fisiologis (VDOT, ACWR, drift, readiness, taper) diletakkan di `src/utils/` — **tidak ada side effect**, mudah di-test
- **Test colocation**: file `.test.ts` ditempatkan di direktori yang sama dengan source-nya (`src/tools/*.test.ts`, `src/utils/*.test.ts`, `src/client.test.ts`)
- **Import extension**: selalu `".js"` (ES Module NodeNext resolution)
- **Error handling**: semua API call return `ApiResult<T>` = `T | ApiError`. Gunakan `isApiError()` untuk branching.
- **No linter config**: Tidak ada `.eslintrc` atau `.prettierrc` di root project.
- **TypeScript strict mode**: `"strict": true` aktif.

## External Integrations
| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Intervals.icu REST API | Sumber data training, wellness, calendar, gear | HTTP Basic Auth (`API_KEY:<key>`) via native `fetch` |

Tidak ada integrasi third-party lain (tidak ada database, tidak ada auth provider, tidak ada payment).

## Environment Variables
| Key | Purpose |
|-----|---------|
| `INTERVALS_API_KEY` | API key dari Intervals.icu (Settings > Developer) — **Wajib** |
| `INTERVALS_ATHLETE_ID` | Default athlete ID, prefix `i` ditambah otomatis jika tidak ada — **Opsional** |
| `INTERVALS_API_BASE_URL` | Override base URL API, default `https://intervals.icu/api/v1` — **Opsional** |

## Development Commands
| Action | Command |
|--------|---------|
| Build | `pnpm run build` (`tsc`) |
| Dev (watch) | `pnpm run dev` (`tsc --watch`) |
| Start | `pnpm run start` (`node dist/index.js`) |
| Test | `pnpm test` (Vitest, 59+ unit tests) |
| MCP Inspector | `pnpm run inspector` (`@modelcontextprotocol/inspector`) |

## Key Files
- `src/index.ts` — Entry point utama; init MCP server + register 10 tool domains via stdio.
- `src/client.ts` — HTTP client terpusat: Basic Auth, auto-retry 429, `resolveAthleteId()`.
- `src/config.ts` — Parsing & validasi env vars (`INTERVALS_API_KEY`, `INTERVALS_ATHLETE_ID`, `INTERVALS_API_BASE_URL`).
- `src/types.ts` — Shared response helpers: `toToolResult()`, `errorResult()`.
- `src/tools/intelligence.ts` — Endurance Intelligence Suite: `predict_race_time`, `calculate_taper_plan`, `analyze_cardiac_drift`, `calculate_readiness_score`.
- `src/tools/events.ts` — Calendar, planned workouts, workout library, `create_running_workout` (Intervals DSL builder).
- `src/tools/customItems.ts` — CRUD custom items (chart, field, zones): `get_custom_items`, `get_custom_item_by_id`, `create_custom_item`, `update_custom_item`, `delete_custom_item`.
- `src/utils/load.ts` — Kalkulasi ACWR, TSB Zones, Ramp Rate, Weekly TSS & Distance Budget.
- `src/utils/vdot.ts` — Jack Daniels VDOT & 5 zona pace calculator.
- `src/utils/drift.ts` — Efficiency Factor (EF) & Aerobic Decoupling dari stream HR vs Power/Speed.
- `src/utils/race.ts` — Race time prediction & taper plan generator.
- `src/utils/readiness.ts` — Composite readiness score 0-100% (TSB + ACWR + Sleep + HRV + RHR Spike).
- `src/utils/cache.ts` — InMemoryCache (TTL-based, zero-dependency). Dipakai oleh gear (30m) & power curves (60m).
- `.env.example` — Template referensi env vars.
- `tsconfig.json` — TS config: ES2022 target, NodeNext module, strict mode.
- `vitest.config.ts` — Test runner config (include: `src/**/*.test.ts`).

## Coaching Methodology (Agent Skills & Workflows)
- **Framework**: Coach Faris Salman + Palladino Power Project (CTL Multiplier System).
- **Struktur Mingguan (Hard-Easy Rhythm)**:
  - Senin: REST TOTAL
  - Selasa: Easy Run + Strides
  - Rabu: Quality 1 (Subthreshold/VO2Max) + Strength Training 1
  - Kamis: Aerobic Base (Easy/Moderate)
  - Jumat: Quality 2 + Strength Training 2
  - Sabtu: Recovery Run
  - Minggu: Long Run (150–200% CTL untuk HM)
- **Beban Sesi (CTL Multiplier)**: Easy 70–90%, Moderate 100–150%, Quality 125–175%, Long Run 150–300% CTL
- **Ramp Rate**: +1 s.d. +3 TSS/minggu (sweetspot)
- **Easy Run Cap**: ≤ 60 menit, TSS < 100% CTL
- **Mesosiklus**: 5 Minggu — W1 Baseline → W2-3 Build (+3-8%) → W4 Deload (-10% dari W1) → W5 New Baseline
- **Single Run Safeguard**: <105% 30-Day Max TSS = Aman, ≥115% = High Risk
- **Race Priority**: A (Full Taper) → B (Partial Taper) → C (Training Run, No Taper)
- **Race A Aktif**: **Malioboro Run HM — 4 Oktober 2026** (Muhammad Hadid Wiransetyo)
- **Recovery Protocol**: Dynamic Warm-Up (5–8m pre-run), Static Cool-Down (5–10m post-run), Foam Rolling SMR (10–15m malam)

## Known Decisions & Constraints
- **Rate-limit Handling**: HTTP client menangani 429 dengan exponential backoff + jitter (max 3 retry), respek header `Retry-After`.
- **In-memory Cache**: Gear (TTL 30m) dan Power Curves (TTL 60m) di-cache per athlete+activityType. Cache bersifat volatile — direset saat server restart.
- **Stateless**: Tidak ada database lokal. Semua data berasal langsung dari Intervals.icu API.
- **No linter/formatter config**: Tidak ada `.eslintrc` atau `.prettierrc` — standar formatting bergantung pada TypeScript strict mode.
- **ESM-only**: `"type": "module"` di `package.json`, semua import harus pakai `.js` extension.
- **Node.js >=18**: Menggunakan native `fetch` (built-in sejak Node 18), tidak ada dependency `axios`/`node-fetch`.
- **Test coverage**: 59+ unit tests via Vitest, termasuk VDOT math, race prediction, cardiac drift, readiness scoring, ACWR, DSL validation, LRU cache, dan API client retry.

## Planned Features (Implementation Plans — Semua Completed)
| # | Feature | Status |
|---|---------|--------|
| 1 | Athlete Profile & Training Zones | **Completed** |
| 2 | Fitness Chart CTL/ATL/TSB | **Completed** |
| 3 | Workout Library | **Completed** |
| 4 | Rate-limit Retry + In-memory Cache | **Completed** |
| 5 | Pace Zone & VDOT Calculator | **Completed** |
| 6 | Training Load, ACWR & Weekly Budget | **Completed** |
| 7 | Structured Running Workout Builder | **Completed** |
| 8 | Agent Skills & Workflows Integration | **Completed** |
| 9 | Training Plan Intelligence & Distance Budgeting | **Completed** |
| 10 | Endurance Intelligence Suite (race predict, taper, drift, readiness) | **Completed** |
| 11 | Skills & Workflows Quality & Robustness Fixes | **Completed** |
| 12 | All-Star Open-Source README & User Guide | **Completed** |
| 13 | Skill & Workflow Re-alignment — Coach Salman / Palladino Methodology | **Completed** |
| 14 | Weekly Schedule (Mon REST, Sun LR) & Recovery Protocols | **Completed** |

> Plan files tersimpan di `docs/plans/` (15 files, arsip historis).
