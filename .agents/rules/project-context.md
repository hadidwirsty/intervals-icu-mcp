# Context Memory — intervals-icu-mcp
_Last updated: 2026-08-16_

## Project Overview
Proyek ini adalah sebuah server Model Context Protocol (MCP) untuk Intervals.icu API. Server ini memungkinkan AI agent untuk berinteraksi langsung dan mengambil data training atlet (activities, wellness, events, gear, power curves, dan custom items) dari Intervals.icu.

## Tech Stack
| Category | Library / Tool | Version |
|----------|---------------|---------|
| Runtime | Node.js | >=18 |
| Language | TypeScript | ^5.7.2 |
| Protocol SDK | @modelcontextprotocol/sdk | ^1.30.0 |
| Validation / Types | zod | ^4.4.3 |
| Package Manager | pnpm | (via lockfile) |

## Architecture
Arsitektur sederhana yang bersifat fungsional, berfokus pada pendaftaran command MCP. Logika pemanggilan HTTP ke API (Intervals.icu) dipisah ke `src/client.ts`, pengaturan konfigurasi ke `src/config.ts`, sedangkan handler dari masing-masing perintah MCP dipecah ke dalam file berbeda menurut domain datanya di dalam subfolder `src/tools/`.

## Directory Structure
```text
intervals-icu-mcp/
├── .agents/       # Template konfigurasi Antigravity Agent (skills, workflows)
├── dist/          # Direktori hasil build dari kompilasi TypeScript
├── src/           # Direktori root untuk kode sumber TypeScript
│   └── tools/     # Kumpulan file handler untuk domain tool MCP (activities, events, wellness, dll)
```

## Code Conventions
- File naming: `camelCase` (misalnya `powerCurves.ts`, `customItems.ts`).
- Entry point utama ada di `src/index.ts` yang menginisialisasi server MCP dan me-register seluruh tool.
- Tidak ditemukan konfigurasi alat linter atau formatter (misalnya `.eslintrc` atau `.prettierrc`) pada level root proyek.

## External Integrations
| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Intervals.icu API | Sumber data training dan kesehatan pengguna | REST API (menggunakan Basic Auth: user `API_KEY` dan pass key) |

## Environment Variables
| Key | Purpose |
|-----|---------|
| INTERVALS_API_KEY | API Key dari Intervals.icu untuk autentikasi (Wajib) |
| INTERVALS_ATHLETE_ID | Default Athlete ID bila tidak di-supply pada command call (Opsional) |
| INTERVALS_API_BASE_URL | Base URL Intervals.icu untuk override default `https://intervals.icu/api/v1` (Opsional) |

## Development Commands
| Action | Command |
|--------|---------|
| Start dev | `pnpm run dev` (alias untuk `tsc --watch`) |
| Build | `pnpm run build` (alias untuk `tsc`) |
| Start | `pnpm run start` (menjalankan `node dist/index.js`) |
| Inspector | `pnpm run inspector` (menggunakan `@modelcontextprotocol/inspector` untuk debug tool lokal) |
| Test / Lint | `pnpm test` (Vitest unit testing) |

## Key Files
- `src/index.ts` — Entry point utama, registrasi MCP Server dan tools list.
- `src/client.ts` — Modul HTTP client pusat (mendukung auto-retry exponential backoff pada 429).
- `src/tools/athlete.ts` — Tool `get_athlete_profile` & `get_training_zones`.
- `src/tools/calculator.ts` — Tool offline `calculate_vdot` & `calculate_pace_zones`.
- `src/tools/events.ts` — Tool events, calendar, planned workouts, `get_workout_library`, `get_workout_by_id`, `create_running_workout`.
- `src/tools/load.ts` — Tool offline `analyze_training_load` & `calculate_weekly_budget`.
- `src/tools/wellness.ts` — Tool `get_wellness_data` & `get_fitness_chart`.
- `src/utils/date.ts` — Helper pure function `getDefaultDateRange()`.
- `src/utils/dsl.ts` — Utility validasi & sanitasi Teks DSL Workout Builder (`validateWorkoutDsl`).
- `src/utils/load.ts` — Kalkulator fisiologis ACWR, TSB Zones, Ramp Rate, Weekly Budget & Distance Budget (`analyzeTrainingLoad`, `calculateWeeklyBudget`, `calculateDistanceBudget`).
- `src/utils/retry.ts` — Kalkulasi retry delay & jitter.
- `src/utils/cache.ts` — Class InMemoryCache (TTL-based) zero-dependency.
- `src/utils/vdot.ts` — Kalkulator fisiologis lari Jack Daniels (`calculateVdot`, `calculatePaceZones`).
- `src/config.ts` — Membaca dan menvalidasi nilai dari Environment Variables.
- `.env.example` — Templat referensi untuk konfigurasi environment variabel yang diperlukan server.

## Coaching Methodology (Agent Skills & Workflows)
- **Framework**: Coach Faris Salman + Palladino Power Project (CTL Multiplier System).
- **Struktur Mingguan (Hard-Easy Rhythm)**: Senin REST TOTAL, Selasa Easy + Strides, Rabu Quality 1 + ST 1, Kamis Aerobic Base, Jumat Quality 2 + ST 2, Sabtu Recovery Run, Minggu Long Run (150–200% CTL untuk HM).
- **Strength Training Protocol**: Prinsip *"Keep Hard Days Hard, Keep Easy Days Easy"* (2x/minggu di hari Rabu & Jumat post-run/sore).
- **Protokol Pemulihan**: Dynamic Warm-Up (5–8m pre-run), Static Cool-Down (5–10m post-run), Foam Rolling SMR (10–15m malam/pre-bed pada 5 area kunci).
- **Beban Sesi**: Berbasis CTL Multiplier (Easy 70–90% CTL, Moderate 100–150%, Quality 125–175%, Long Run 150–300%), bukan proporsi % kaku dari total mingguan.
- **Easy Run Cap**: Durasi ≤ 60 menit, TSS < 100% CTL. Kenaikan beban mingguan dialokasikan ke Quality Days.
- **Ramp Rate Sweetspot**: +1 s.d. +3 TSS/minggu (bukan +5% default lama).
- **Mesosiklus**: Blok 5 Minggu (W1 Baseline → W2-3 Build +3-8% → W4 Deload **-10% dari W1** → W5 New Baseline).
- **Single Run Safeguard**: TSS sesi vs 30-Day Max TSS (< 105% aman, ≥ 115% High Risk).
- **Race Priority**: A (Full Taper) → B (Partial Taper) → C (Training Run, No Taper).
- **Race A Aktif**: Malioboro Run HM — 4 Oktober 2026 (Muhammad Hadid Wiransetyo).

## Known Decisions & Constraints
- **Rate-limit Handling & Caching:** HTTP client kini menangani error 429 otomatis dengan retry exponential backoff (max 3x retry) dan header `Retry-After`. InMemoryCache (TTL-based) diterapkan pada gear (30m) dan power curves (60m).
- Eksekusi murni berbasis read/write data dari Intervals tanpa adanya _database_ lokal (stateless).
- Test framework **Vitest** telah dipasang dan dikonfigurasi (`pnpm test`). Total 52 unit tests.

## Planned Features (Implementation Plans Tersedia)
| # | Feature | Plan File | Status |
|---|---------|----------|--------|
| 1 | Athlete Profile & Training Zones (`get_athlete_profile`, `get_training_zones`) | `docs/plans/2026-08-08-athlete-profile-zones-1.md` | **Completed** |
| 2 | Fitness & Form Chart CTL/ATL/TSB (`get_fitness_chart`) | `docs/plans/2026-08-08-fitness-form-chart-2.md` | **Completed** |
| 3 | Workout Library (`get_workout_library`, `get_workout_by_id`) | `docs/plans/2026-08-08-workout-library-3.md` | **Completed** |
| 4 | Rate-limit Retry + In-memory Cache | `docs/plans/2026-08-08-rate-limit-caching-4.md` | **Completed** |
| 5 | Pace Zone & VDOT Calculator (`calculate_vdot`, `calculate_pace_zones`) | `docs/plans/2026-08-08-pace-zone-vdot-5.md` | **Completed** |
| 6 | Training Load, ACWR & Weekly Budget Calculator (`analyze_training_load`, `calculate_weekly_budget`) | `docs/plans/2026-08-08-training-load-budget-6.md` | **Completed** |
| 7 | Structured Running Workout Builder to Intervals.icu Calendar (`create_running_workout`) | `docs/plans/2026-08-08-structured-workout-builder-7.md` | **Completed** |
| 8 | Agent Skills & Workflows Integration for Structured Workout Builder (`/create-workout`, `create_running_workout`) | `docs/plans/2026-08-08-workout-builder-skills-workflows-8.md` | **Completed** |
| 9 | Training Plan Intelligence & Distance Budgeting (`/backcast-plan`, `/mesocycle-block`, dual-mode budget) | `docs/plans/2026-08-10-training-plan-intelligence-9.md` | **Completed** |
| 10 | Endurance Intelligence Suite (`predict_race_time`, `calculate_taper_plan`, `analyze_cardiac_drift`, `calculate_readiness_score`) | `docs/plans/2026-08-12-endurance-intelligence-suite-10.md` | **Completed** |
| 11 | Skills & Workflows Quality & Robustness Fixes (Section numbering, tool chain & fallback) | `docs/plans/2026-08-16-skills-workflows-quality-fixes-11.md` | **Completed** |
| 12 | All-Star Open-Source README & User Guide Upgrade (Quickstart, Workflows Guide, Multi-Client JSON) | `docs/plans/2026-08-16-allstar-readme-user-guide-12.md` | **Completed** |
| 13 | Skill & Workflow Re-alignment — Coach Salman / Palladino Power Project Methodology | *(No plan file — direct update)* | **Completed** |
| 14 | New Weekly Schedule (Mon Rest, Sun LR, Wed/Fri Quality+ST) & Recovery Protocols (Warm-Up, Cool-Down, SMR) | `docs/plans/2026-08-16-training-schedule-protocols-14.md` | **Completed** |

## Planned Directory Additions
```text
src/
  tools/
    athlete.ts       # [Planned] Athlete profile & training zones tools
    calculator.ts    # [Planned] VDOT & pace zone calculator tools
  utils/
    cache.ts         # [Planned] InMemoryCache class (TTL-based)
    date.ts          # [Planned] getDefaultDateRange() pure helper
    retry.ts         # [Planned] calculateRetryDelay() pure helper
    vdot.ts          # [Planned] calculateVdot() & calculatePaceZones() pure functions
docs/
  plans/             # Implementation plans (5 files)
```
