# Context Memory — intervals-icu-mcp
_Last updated: 2026-10-26_

## Project Overview
Server **Model Context Protocol (MCP)** resmi untuk Intervals.icu API sekaligus sistem **AI Running Coach Intelligence** berbasis **Dual-Engine Ecosystem** (Intervals.icu + Garmin Connect). Server ini mengekspos **39 MCP tools** ke AI client (Claude Desktop, Antigravity, Cursor, VS Code Cline/Roo-Code) untuk membaca telemetri aktivitas real-time, mengevaluasi beban latihan kronis dan berkelanjutan (CTL/ATL/TSB/ACWR/Ramp Rate), menghitung matriks Norwegian Singles (NSA) Copeland, mendiagnosis defisiensi aerobik (ADS) via Hadd & Horwill, memetakan zona detak jantung absolut Hadd, memprediksi waktu race & tapering 10–14 hari, menghitung kebutuhan fueling gel energi, serta mempublikasikan sesi latihan terstruktur langsung ke kalender Intervals.icu via Teks DSL.

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
| Test Framework | Vitest | `^4.1.10` | 114 unit tests across 22 test files (100% pass) |

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
   - Menangani kalkulasi VDOT Jack Daniels, matriks interval Norwegian Singles Copeland (`nsa.ts`), zona fisiologis & ADS John Hadd (`hadd.ts`), protokol fueling karbohidrat (`fueling.ts`), prediksi waktu race & tapering (`race.ts`), cardiac drift / aerobic decoupling (`drift.ts`), komposit readiness score (`readiness.ts`), formula ACWR/load budgeting (`load.ts`), validator Teks DSL (`dsl.ts`), exponential backoff retry (`retry.ts`), dan volatile cache (`cache.ts`).
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
│   ├── rules/                    # Context memory & persistent rules
│   │   ├── norwegian-singles-guardrails.md # Invariant guardrails metodologi NSA & batas fisiologis
│   │   └── project-context.md    # Single source of truth context file (file ini)
│   └── skills/                   # 6 Specialized Unified Agent Skills (Dual-Engine Ready)
│       ├── cek-kesiapan/         # /cek-kesiapan (evaluasi kesiapan fisik, 0-100% composite score & Red Flags)
│       ├── jadwal-minggu/        # /jadwal-minggu (jadwal mingguan deterministik, 42-day rolling budget Faris/Palladino)
│       ├── kalibrasi-atlet/      # /kalibrasi-atlet (VDOT, matriks Copeland, Hadd zones, diagnosa ADS, audit Garmin Z2)
│       ├── lapor-lari/           # /lapor-lari (evaluasi pasca-sesi, telemetri daya, kepatuhan sub-T, EF drift)
│       ├── panduan-kekuatan/     # /panduan-kekuatan (kekuatan fungsional pelari, McGill Big 3 & Soleus armor)
│       └── strategi-lomba/       # /strategi-lomba (hierarki A/B/C race Faris Salman, tapering, pacing CP & fueling gel)
├── dist/                         # Hasil kompilasi tsc (CJS/ESM build)
├── docs/                         # Dokumentasi & arsip referensi
│   ├── WORKFLOWS-GUIDE.md        # Panduan alur eksekusi kronologis skills & tools
│   └── references/               # Pustaka sains & referensi fisiologi endurance
│       ├── aerobic-foundation/   # Biogenesis mitokondria, 10% rule Uphill Athlete & ADS
│       ├── faris-salman/         # Heart rate response, Norwegian model, running budget, periodisasi 3-1 & A/B/C race
│       ├── garmin-vo2max/        # Algoritma Firstbeat, validasi Cooper Clinic & HR drift
│       ├── hadd/                 # John Hadd approach, lactate dynamics, 2400m test & toothpaste periodization
│       ├── running-anatomy/      # 8 kelompok otot utama lari & biomekanika kinetik
│       └── steve-magness/        # NSA deep dive, LT2 lactate threshold, base building, long run & strength
├── src/                          # TypeScript source code
│   ├── tools/                    # 10 domain tool handler modules (39 tools total)
│   │   ├── activities.ts         # 6 tools: get_activities, get_activity_*, add_activity_message
│   │   ├── athlete.ts            # 2 tools: get_athlete_profile, get_training_zones
│   │   ├── calculator.ts         # 3 tools: calculate_vdot, calculate_pace_zones, calculate_nsa_matrix
│   │   ├── customItems.ts        # 5 tools: CRUD custom items (charts, fields, zones)
│   │   ├── events.ts             # 8 tools: calendar events, planned workouts, library, DSL builder
│   │   ├── gear.ts               # 1 tool: get_gear_list (cache 30m)
│   │   ├── intelligence.ts       # 10 tools: predict_race_time, calculate_taper_plan, analyze_cardiac_drift,
│   │   │                         #          calculate_readiness_score, calculate_race_fueling, diagnose_aerobic_base,
│   │   │                         #          calculate_hadd_zones, estimate_aerobic_threshold, dll.
│   │   ├── load.ts               # 2 tools: analyze_training_load, calculate_weekly_budget
│   │   ├── powerCurves.ts        # 1 tool: get_athlete_power_curves (cache 60m)
│   │   └── wellness.ts           # 2 tools: get_wellness_data, get_fitness_chart
│   ├── utils/                    # 12 pure function modules
│   │   ├── cache.ts              # InMemoryCache TTL generic class
│   │   ├── date.ts               # Date range helper (default 30d)
│   │   ├── drift.ts              # Efficiency Factor (EF) & Aerobic Decoupling math
│   │   ├── dsl.ts                # Intervals Text DSL syntax validator
│   │   ├── fueling.ts            # Carbs/hydration fueling intake calculator & osmolarity
│   │   ├── hadd.ts               # John Hadd absolute HR zones & ADS diagnostic engine
│   │   ├── load.ts               # ACWR, Ramp Rate, TSB zones, budget math
│   │   ├── nsa.ts                # Copeland Norwegian Singles matrix & duration distribution
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

## Complete MCP Tools Directory (39 Tools)
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
| | `calculate_nsa_matrix` | Hitung matriks kecepatan & daya interval Norwegian Singles Copeland |
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
| | `calculate_race_fueling` | Hitung kebutuhan gram karbohidrat, jadwal gel, & hidrasi |
| | `diagnose_aerobic_base` | Diagnosa defisiensi aerobik (ADS) via Uphill Athlete 10% & Horwill |
| | `calculate_hadd_zones` | Hitung zona detak jantung absolut John Hadd & ambang sub-T |
| | `estimate_aerobic_threshold` | Estimasi Ambang Aerobik (AeT) berbasis HRmax & drift telemetry |
| **Load & Periodization**| `analyze_training_load` | Evaluasi CTL, ATL, TSB, Ramp Rate, & rasio ACWR |
| | `calculate_weekly_budget` | Hitung budget mingguan berbasis durasi/load 42-hari |
| **Power Curves** | `get_athlete_power_curves` | Power duration curve kurva daya lari/sepeda (cache 60m) |
| **Wellness** | `get_wellness_data` | Catatan harian berat badan, sleep, RHR, HRV, soreness |
| | `get_fitness_chart` | Data time series fitness chart (CTL, ATL, TSB, Ramp Rate) |

## Development Commands
| Command | Action | Description |
|---|---|---|
| `pnpm run build` | Build | Kompilasi TypeScript via `tsc` ke direktori `dist/` |
| `pnpm run dev` | Dev (Watch) | Menjalankan `tsc --watch` untuk auto-compile saat file berubah |
| `pnpm run start` | Start | Menjalankan MCP server melalui Node.js (`dist/index.js`) |
| `pnpm test` | Test Suite | Menjalankan Vitest (114 test cases di 22 test files) |
| `pnpm run inspector`| Debug MCP | Menjalankan `@modelcontextprotocol/inspector` untuk inspeksi UI tools |

## Environment Variables
| Variable | Required | Description |
|---|---|---|
| `INTERVALS_API_KEY` | **Ya** | API Key dari akun Intervals.icu (`Settings` > `Developer Settings`) |
| `INTERVALS_ATHLETE_ID` | Opsional | ID atlet default (misal: `i123456` atau `123456`). Jika kosong, wajib disertakan di parameter tool |
| `INTERVALS_API_BASE_URL` | Opsional | Base URL API Intervals.icu. Default: `https://intervals.icu/api/v1` |

## Code Conventions & Standards
- **Supreme Standard**: Mematuhi standar keamanan, arsitektur berbasis pengujian, dan modularitas ketat.
- **Clean Code**: Sesuai konvensi penamaan seragam, import ESM eksplisit dengan ekstensi `.js`.
- **Pure Functions**: Logika bisnis & fisiologis (VDOT, NSA, Hadd, Fueling, ACWR, Cardiac Drift, Tapering, Readiness) wajib ditaruh di `src/utils/` tanpa I/O side-effects.
- **NodeNext ES Modules**: Seluruh import lokal wajib menyertakan ekstensi `.js` (contoh: `import { config } from "./config.js";`).
- **Error Handling**: Tidak ada error yang ditelan secara diam-diam. Selalu return `errorResult(message)` atau objek `ApiError` yang eksplisit.
- **Test Colocation**: Setiap modul memiliki file unit test berdampingan (`*.test.ts`) dengan mock dependency terisolasi.

## Coaching Methodology & Athlete Context

### Coaching Framework
- **Metodologi Inti**: **Norwegian Singles Training Method** (`norwegiansingles.run`) dipadukan dengan prinsip **John Hadd** dan manajemen beban **Faris Salman / Palladino**.
- **Prinsip Utama NSA**:
  1. **Fokus Sub-Threshold**: Seluruh latihan kualitas berfokus tepat di bawah ambang laktat kedua (LT2 / 85–95% CP / 2.0–3.0 mmol/L).
  2. **Kontrol Intensitas Ketat**: *"Erring slightly slower is safer than going too fast"*.
  3. **Aturan Durasi 75/25 & Evolusi 20–22% [Copeland 2026]**: ~20–25% durasi kerja Sub-T per minggu, 75–80% Easy & Long Run (< 70% Max HR).
  4. **Jeda Istirahat Interval [NSA §2.2, Copeland 2026]**: Rest 30–60 detik antar repetisi berupa berdiri, jalan santai, atau slow jog. Kaidah tegas: *"Shortening recovery or jogging faster is NOT a progression target"*.
  5. **Konsolidasi Beban ("Change One Thing at a Time")**: Tahan beban stabil minimal 1 bulan sebelum menambah volume. Setiap +1 rep 3m Sub-T wajib dipasangkan dengan +12 menit Easy Run santai.
  6. **Konsistensi Sepanjang Tahun**: Pola mingguan terstruktur yang memisahkan hari kualitas dan hari pemulihan secara disiplin.

#### Profil Fisiologis Atlet (Konfigurasi Dinamis & Template)
Seluruh parameter fisiologis utama atlet diekstrak secara dinamis dari akun Intervals.icu via MCP:
- **CP / FTP Lari**: Diekstrak dari `icu_ftp` (aktivitas) atau `ftp` (`get_athlete_profile`).
- **W' (Anaerobic Work Capacity)**: Diekstrak dari `icu_w_prime`.
- **LTHR**: Diekstrak dari `lthr`.
- **Max HR**: Diekstrak dari `athlete_max_hr` (selalu prioritaskan Max HR aktual terukur).
- **Resting HR**: Diekstrak dari `icu_resting_hr` / `get_wellness_data.restingHR`.
- **Berat Badan**: Diekstrak dari `icu_weight` / `get_wellness_data.weight`.
- **VDOT**: Dihitung via tool `calculate_vdot` dari hasil race atau time trial terkini.
- **Threshold Pace**: Dihitung dari VDOT atau diekstrak dari profil Intervals.icu.
- **Panduan Pace & Power Sub-T & Easy**:
  - Easy / Recovery: 70–77% CP (< 70% Max HR).
  - Sub-T Long: 85–90% CP.
  - Sub-T Medium: 87–92% CP.
  - Sub-T Fast: 90–95% CP.
- **Disiplin Easy Run**:
  - Dilarang memaksakan pace kencang pada hari Easy Run guna mencegah akumulasi kelelahan glikogen kronis dan risiko impak sendi.

### Heat Adjustment Protocol (Iklim Tropis / Cuaca Panas)
- Kondisi lari pada iklim tropis hangat & lembab: Suhu 24–28°C, kelembapan 70–85%.
- Efek drift HR: Kenaikan +10–15 bpm lebih tinggi akibat stres termal pendinginan tubuh.
- **Aturan Operasional**: **POWER adalah kontrol primer, HR adalah monitor sekunder yang fleksibel**.
- Plafon Easy Run HR:
  - Suhu normal (< 20°C): $\le 70\%$ HRmax.
  - Suhu tropis hangat (20–28°C): Kenaikan toleransi hingga ~74% HRmax diperbolehkan selama Power tetap berada di koridor santai ($\le 77\%$ CP).

### 4 Red Flags Kelelahan (Pemicu Deload Adaptif)
Jika $\ge 2$ sinyal berikut aktif, segera lakukan *adaptive deload* (potong durasi repetisi 50%):
1. RHR pagi naik $> 5$ bpm di atas baseline.
2. Kualitas tidur buruk 2 malam berturut-turut ($< 70\%$ atau durasi $< 6$ jam).
3. Kehilangan motivasi lari drastis (kelelahan sistem saraf pusat / CNS).
4. Easy pace terasa berat pada daya normal ($> 1$ level RPE lebih tinggi).
