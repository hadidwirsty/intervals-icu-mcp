# Context Memory — intervals-icu-mcp
_Last updated: 2026-09-12_

## Project Overview
Server **Model Context Protocol (MCP)** resmi untuk Intervals.icu API sekaligus sistem **AI Running Coach Intelligence** berbasis **Norwegian Singles Training Method** (`docs/references/norwegian-singles/`). Mengekspos **33 MCP tools** ke AI assistant (Claude Desktop, Antigravity, Cursor, VS Code Cline/Roo-Code) untuk membaca telemetri aktivitas real-time, mengevaluasi beban latihan kronis dan berkelanjutan (CTL/ATL/TSB/ACWR), menghitung estimasi ambang sub-threshold & VDOT, menganalisis cardiac drift & aerobic decoupling, memprediksi waktu race & tapering 10–14 hari, serta mempublikasikan sesi latihan terstruktur langsung ke kalender Intervals.icu via Teks DSL.

## Tech Stack
| Category | Library / Tool | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | `>=18.0.0` | Native `fetch` built-in, zero external HTTP dependencies |
| Language | TypeScript | `^5.7.2` | Strict mode, target ES2022, NodeNext module resolution |
| Module System | ES Modules | `"type": "module"` | Semua local import wajib berakhiran `.js` |
| Protocol SDK | `@modelcontextprotocol/sdk` | `^1.30.0` | Stdio server transport |
| Validation | `zod` | `^4.4.3` | Schema validation pada semua tool boundary |
| Package Manager | `pnpm` | — | Dikelola via `pnpm-lock.yaml` |
| Build Tool | TypeScript Compiler (`tsc`) | `^5.7.2` | Output ke direktori `dist/` |
| Test Framework | Vitest | `^4.1.10` | 63 unit tests across 15 test files (100% pass) |

## Architecture & Design Patterns
Arsitektur **fungsional + domain-layered** tanpa framework HTTP server tambahan. Entry point (`src/index.ts`) menginisialisasi MCP server via `stdio` transport dan mendaftarkan 10 domain tool modules.

### Three-Tier Layering
1. **Tool Handlers (`src/tools/`)**:
   - Memetakan MCP tool registration (`server.registerTool` atau `server.tool`).
   - Validasi parameter boundary menggunakan Zod schema.
   - Mengambil data melalui `src/client.ts` atau memanggil pure logic dari `src/utils/`.
   - Mengembalikan response terstandarisasi via `toToolResult()` atau `errorResult()`.
2. **Pure Utility & Physiology Engine (`src/utils/`)**:
   - Fungsi murni (*pure functions*) tanpa side effect (I/O isolation).
   - Menangani kalkulasi VDOT Jack Daniels, prediksi waktu race, tapering, cardiac drift (aerobic decoupling), komposit readiness score, formula ACWR/load budgeting, validator Teks DSL, exponential backoff retry, dan volatile cache.
3. **HTTP Infrastructure Client (`src/client.ts`)**:
   - HTTP client terpusat ke Intervals.icu REST API menggunakan HTTP Basic Auth (`API_KEY:<key>`).
   - Penanganan error granular (401, 403, 404, 422, 429, 500, 503).
   - Auto-retry exponential backoff dengan jitter untuk status 429 (Too Many Requests), menghormati header `Retry-After`.
   - Helper otomatis `resolveAthleteId()` yang memvalidasi prefix `"i"`.

### Caching & State
- **Stateless**: Server tidak memiliki database lokal. Seluruh state atlet tersimpan di Intervals.icu.
- **In-Memory Volatile Cache (`src/utils/cache.ts`)**: Caching dengan TTL digunakan untuk data yang jarang berubah:
  - Gear list: TTL 30 menit (`src/tools/gear.ts`).
  - Athlete power curves: TTL 60 menit (`src/tools/powerCurves.ts`).
  - Cache otomatis ter-reset saat server restart.

## Directory Structure
```text
intervals-icu-mcp/
├── .agents/                      # Konfigurasi AI Agent (Antigravity & Subagents)
│   ├── README.md                 # Panduan arsitektur & direktori 12 skills NSA
│   ├── rules/                    # Context memory & persistent rules
│   │   ├── norwegian-singles-guardrails.md # Invariant guardrails metodologi NSA & batas fisiologis
│   │   └── project-context.md    # Single source of truth context file (file ini)
│   └── skills/                   # 12 specialized agent skills (Pure Norwegian Singles)
│       ├── calc-nsa/             # /calc-nsa (matriks interval Time-Based 1m s.d. 15m)
│       ├── calc-vdot/            # /calc-vdot (VDOT & penetapan ambang sub-T)
│       ├── cardiac-drift/        # /cardiac-drift (aerobic decoupling & EF telemetry)
│       ├── check-workout/        # /check-workout (inspeksi kalender & planned sessions)
│       ├── create-workout/       # /create-workout (publikasi DSL workout ke kalender)
│       ├── fitness-status/       # /fitness-status (evaluasi CTL/ATL/TSB & Green Zone)
│       ├── predict-race/         # /predict-race (proyeksi race time & A-Taper 10-14 hari)
│       ├── readiness-check/      # /readiness-check (evaluasi pemulihan 0-100% Green/Yellow/Red)
│       ├── run-report/           # /run-report (laporan audit kepatuhan intensitas LT2)
│       ├── running-coach-analysis/# Master coaching knowledge & exercise physiology NSA
│       ├── training-load-analysis/# Scientific sustainable load & 75/25 duration split
│       └── weekly-budget/        # /weekly-budget (alokasi durasi mingguan 5-9 jam)
├── dist/                         # Hasil kompilasi tsc (CJS/ESM build)
├── docs/                         # Dokumentasi & arsip referensi
│   ├── WORKFLOWS-GUIDE.md        # Panduan alur eksekusi kronologis 10 slash commands
│   ├── references/
│   │   └── norwegian-singles/    # Data referensi & dataset literatur norwegiansingles.run
│   └── specs/                    # Design documents & RFCs
├── src/                          # TypeScript source code
│   ├── tools/                    # 10 domain tool handler modules (33 tools total)
│   │   ├── activities.ts         # 6 tools: get_activities, get_activity_*, add_activity_message
│   │   ├── athlete.ts            # 2 tools: get_athlete_profile, get_training_zones
│   │   ├── calculator.ts         # 2 tools: calculate_vdot, calculate_pace_zones
│   │   ├── customItems.ts        # 5 tools: CRUD custom items (charts, fields, zones)
│   │   ├── events.ts             # 8 tools: calendar events, planned workouts, library, DSL builder
│   │   ├── gear.ts               # 1 tool: get_gear_list (cache 30m)
│   │   ├── intelligence.ts       # 4 tools: race predict, taper plan, cardiac drift, readiness score
│   │   ├── load.ts               # 2 tools: analyze_training_load, calculate_weekly_budget
│   │   ├── powerCurves.ts        # 1 tool: get_athlete_power_curves (cache 60m)
│   │   └── wellness.ts           # 2 tools: get_wellness_data, get_fitness_chart
│   ├── utils/                    # 9 pure function modules
│   │   ├── cache.ts              # InMemoryCache TTL generic class
│   │   ├── date.ts               # Date range helper (default 30d)
│   │   ├── drift.ts              # Efficiency Factor (EF) & Aerobic Decoupling math
│   │   ├── dsl.ts                # Intervals Text DSL syntax validator
│   │   ├── load.ts               # ACWR, Ramp Rate, TSB zones, budget math
│   │   ├── race.ts               # Race time predictor & taper plan generator
│   │   ├── readiness.ts          # Composite readiness score engine (0-100%)
│   │   ├── retry.ts              # Exponential backoff + jitter calculator
│   │   └── vdot.ts               # Jack Daniels VDOT formula & pace zones table
│   ├── client.ts                 # HTTP client (Basic Auth, fetch, 429 retry, athleteId resolution)
│   ├── config.ts                 # Environment variable reader & validation
│   ├── index.ts                  # Server entry point (StdioServerTransport + tool registry)
│   └── types.ts                  # Standard MCP CallToolResult wrappers
├── .env.example                  # Template konfigurasi environment
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # Konfigurasi TypeScript (ES2022, NodeNext, strict)
└── vitest.config.ts              # Konfigurasi Vitest runner
```

## Complete MCP Tools Directory (33 Tools)
| Domain | Tool Name | Description |
|---|---|---|
| **Activities** | `get_activities` | Ambil daftar aktivitas latihan dalam rentang tanggal |
| | `get_activity_details` | Ambil detail lengkap 1 aktivitas (pace, HR, cadence, watts) |
| | `get_activity_intervals` | Ambil data interval split per putaran/lap |
| | `get_activity_streams` | Ambil stream telemetri detik-per-detik (watts, HR, cad, vel) |
| | `get_activity_messages` | Ambil chat/komentar pada aktivitas |
| | `add_activity_message` | Tambah catatan/feedback coaching ke aktivitas |
| **Athlete** | `get_athlete_profile` | Profil fisiologis atlet (FTP/CP, LTHR, weight, resting HR) |
| | `get_training_zones` | Zona latihan terkini (Power 7-Zone, HR Friel, Pace zones) |
| **Calculator** | `calculate_vdot` | Hitung nilai Jack Daniels VDOT dari race time/jarak |
| | `calculate_pace_zones` | Hitung 5 zona pace (Easy, Marathon, Threshold, Interval, Repetition) |
| **Calendar & Events** | `get_events` | Ambil kalender latihan (planned & completed workouts) |
| | `get_event_by_id` | Ambil detail satu planned event berdasarkan ID |
| | `delete_event` | Hapus event/workout dari kalender |
| | `add_or_update_planned_workout`| Tambah/ubah planned workout di kalender |
| | `add_or_update_note` | Tambah catatan/target non-workout ke kalender |
| | `get_workout_library` | Ambil pustaka template workout tersimpan |
| | `get_workout_by_id` | Ambil detail template workout dari library |
| | `create_running_workout` | Buat & jadwalkan structured running workout via Teks DSL |
| **Custom Items** | `get_custom_items` | Daftar custom chart, field, atau interval field |
| | `get_custom_item_by_id` | Ambil custom item spesifik |
| | `create_custom_item` | Buat custom item baru |
| | `update_custom_item` | Perbarui metadata custom item |
| | `delete_custom_item` | Hapus custom item |
| **Gear** | `get_gear_list` | Ambil daftar sepatu/peralatan & jarak tempuh (cache 30m) |
| **Intelligence** | `predict_race_time` | Prediksi race finish time berbasis VDOT + koreksi CTL & TSB |
| | `calculate_taper_plan` | Pola tapering 10-14 hari (A-Taper NSA volume -35% lalu -50%) |
| | `analyze_cardiac_drift` | Hitung Aerobic Decoupling (EF paruh 1 vs paruh 2) dari stream data |
| | `calculate_readiness_score`| Skor kesiapan komposit 0-100% (TSB, ACWR, Sleep, RHR Spike) |
| **Load & Periodization**| `analyze_training_load` | Evaluasi CTL, ATL, TSB, Ramp Rate, & rasio ACWR |
| | `calculate_weekly_budget` | Hitung budget mingguan berbasis durasi/load |
| **Power Curves** | `get_athlete_power_curves` | Power duration curve kurva daya lari/sepeda (cache 60m) |
| **Wellness** | `get_wellness_data` | Catatan harian berat badan, sleep, RHR, HRV, soreness |
| | `get_fitness_chart` | Data time series fitness chart (CTL, ATL, TSB, Ramp Rate) |

## Development Commands
| Command | Action | Description |
|---|---|---|
| `pnpm run build` | Build | Kompilasi TypeScript via `tsc` ke direktori `dist/` |
| `pnpm run dev` | Dev (Watch) | Menjalankan `tsc --watch` untuk auto-compile saat file berubah |
| `pnpm run start` | Start | Menjalankan MCP server melalui Node.js (`dist/index.js`) |
| `pnpm test` | Test Suite | Menjalankan Vitest (63 test cases di 15 test files) |
| `pnpm run inspector`| Debug MCP | Menjalankan `@modelcontextprotocol/inspector` untuk inspeksi UI tools |

## Environment Variables
| Variable | Required | Description |
|---|---|---|
| `INTERVALS_API_KEY` | **Ya** | API Key dari akun Intervals.icu (`Settings` > `Developer Settings`) |
| `INTERVALS_ATHLETE_ID` | Opsional | ID atlet default (misal: `i123456` atau `123456`). Jika kosong, wajib disertakan di parameter tool |
| `INTERVALS_API_BASE_URL` | Opsional | Base URL API Intervals.icu. Default: `https://intervals.icu/api/v1` |

## Code Conventions & Standards
- **Supreme Standard**: Mematuhi `.agents/skills/technical-constitution/SKILL.md` (Security > Testability & Modularity > Error Handling > Language Idioms > Performance).
- **Clean Code**: Sesuai `.agents/skills/clean-code-standards/SKILL.md`.
- **Pure Functions**: Logika bisnis & matematis (VDOT, ACWR, Cardiac Drift, Tapering, Readiness) wajib ditaruh di `src/utils/` tanpa I/O side-effects.
- **NodeNext ES Modules**: Seluruh import lokal wajib menyertakan ekstensi `.js` (contoh: `import { config } from "./config.js";`).
- **Error Handling**: Tidak ada error yang ditelan secara diam-diam. Selalu return `errorResult(message)` atau objek `ApiError` yang eksplisit.
- **Test Colocation**: Setiap modul memiliki file unit test berdampingan (`*.test.ts`) dengan mock dependency terisolasi.

## Coaching Methodology & Athlete Context

### Coaching Framework
- **Metodologi Inti**: **Norwegian Singles Training Method** (`norwegiansingles.run`).
- **Prinsip Utama NSA**:
  1. **Fokus Sub-Threshold**: Seluruh latihan kualitas berfokus tepat di bawah ambang laktat kedua (LT2 / 85–95% CP / 2.0–3.0 mmol/L).
  2. **Kontrol Intensitas Ketat**: *"Erring slightly slower is safer than going too fast"*.
  3. **Aturan Durasi 75/25**: 20–25% durasi kerja Sub-T per minggu, 75–80% Easy Run (< 70% Max HR).
  4. **Istirahat Pasif Singkat**: Rest 30–60 detik antar repetisi berupa berjalan santai atau berdiri, bukan jogging.
  5. **Konsistensi Sepanjang Tahun**: Pola mingguan `E-Q-E-Q-E-Q-LR` yang konstan tanpa siklus blok periodisasi yang rumit.

#### Profil Fisiologis Atlet (Konfigurasi Dinamis & Template)
Seluruh parameter fisiologis utama atlet diekstrak secara dinamis dari akun Intervals.icu via MCP:
- **CP / FTP Lari**: Diekstrak dari `icu_ftp` (aktivitas) atau `ftp` (`get_athlete_profile`).
- **W' (Anaerobic Work Capacity)**: Diekstrak dari `icu_w_prime`.
- **LTHR**: Diekstrak dari `lthr`.
- **Max HR**: Diekstrak dari `athlete_max_hr` (selalu prioritaskan Max HR aktual terukur).
- **Resting HR**: Diekstrak dari `icu_resting_hr` / `get_wellness_data.restingHR`.
- **Berat Badan**: Diekstrak dari `icu_weight` / `get_wellness_data.weight`.
- **VDOT**: Dihitung via tool `calculate_vdot` dari hasil race atau time trial terkini (4–8 pekan terakhir).
- **Threshold Pace**: Dihitung dari VDOT atau diekstrak dari profil Intervals.icu.
- **Panduan Pace & Power Sub-T & Easy**:
  - Easy / Recovery: 70–77% CP (< 70% Max HR).
  - Sub-T Long (30K Pace): 85–92% CP.
  - Sub-T Medium (HM Pace): 92–95% CP.
  - Sub-T Short (15K Pace): 94–96% CP.
  - Sub-T Micro (10K / CV): 96–99% CP.
- **Disiplin Easy Run**:
  - Dilarang memaksakan pace kencang pada hari Easy Run guna mencegah akumulasi kelelahan glikogen kronis dan risiko impak sendi.

### Heat Adjustment Protocol (Iklim Tropis / Cuaca Panas)
- Kondisi lari pada iklim tropis hangat & lembab: Suhu 24–28°C, kelembapan 70–85%.
- Efek drift HR: Kenaikan +10–15 bpm lebih tinggi akibat stres termal pendinginan tubuh.
- **Aturan Operasional**: **POWER adalah kontrol primer, HR adalah monitor sekunder yang fleksibel**.
- Plafon Easy Run HR:
  - Suhu normal (< 20°C): $\le 70\%$ HRmax.
  - Suhu tropis hangat (20–28°C): Kenaikan toleransi hingga ~74% HRmax diperbolehkan selama Power tetap berada di koridor santai ($\le 77\%$ CP). Sesi ini dikategorikan **OK (Tropical/Heat Adjusted)**, bukan pelanggaran.

### Struktur Mingguan Atlet (Hard-Easy Rhythm)
Pola mingguan teratur memisahkan hari Easy dan hari Quality:
- **Senin**: REST TOTAL / Pemulihan aktif.
- **Selasa**: Quality 1 (Sub-Threshold) + Sore: Core stability.
- **Rabu**: Easy Aerobic Run (40–50m, HR $\le 70\%$).
- **Kamis**: Easy Recovery Run (40–45m, HR $\le 70\%$, opsional waktu sore untuk hari puasa).
- **Jumat**: Quality 2 (Sub-Threshold) + Sore: Core stability.
- **Sabtu**: Recovery / Shakeout Run (30–35m, HR $\le 68\%$).
- **Minggu**: Long Run Pure Aerobic (75–90m, HR $\le 70\%$).

### 4 Red Flags Kelelahan (Pemicu Deload Adaptif)
Jika $\ge 2$ sinyal berikut aktif, segera lakukan *adaptive deload* (potong durasi repetisi 50%):
1. RHR pagi naik $> 5$ bpm di atas baseline.
2. Kualitas tidur buruk 2 malam berturut-turut ($< 70\%$ atau durasi $< 6$ jam).
3. Kehilangan motivasi lari drastis (kelelahan sistem saraf pusat / CNS).
4. Easy pace terasa berat pada daya normal ($> 1$ level RPE lebih tinggi).

### Panduan Persiapan Race & A-Tapering NSA (10–14 Hari)
- **Minggu Taper 1 (H-14 s.d. H-8)**: Volume total dipotong ke ~75%, frekuensi lari tetap sama, repetisi Sub-T dipotong 30–40%.
- **Race Week (H-7 s.d. Hari H)**: Volume dipotong ke ~50%, easy run santai 20–30m, 1 sesi aktivasi strides singkat (3–4x 200m), istirahat penuh 1–2 hari jelang lomba.
- **Target TSB Race Day**: **+8 s.d. +15 (Peak Freshness)**.

### Contoh Strategi Rotasi Sepatu (Shoe Rotation Matrix)
1. **Race Day & Key Dress Rehearsals**: *Super Shoe / Plated Trainer* (Max energy return & efisiensi mekanis).
2. **Speed / Intervals / Sub-Threshold**: *Responsive Fast Trainer* (Ringan, gesit, dan stabil untuk repetisi Sub-T).
3. **Daily Aerobic / Easy Runs**: *Daily Cushion Trainer* (Bantalan empuk dan nyaman untuk volume aerobik mingguan).
4. **Recovery / Max Cushion**: *Max Protection Cushion* (Proteksi benturan maksimal untuk shakeout dan pemulihan).
