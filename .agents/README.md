# Running Coach AI — Panduan Konfigurasi

Folder `.agents/` berisi template **Antigravity Agent** (skills & rules) untuk membangun Running Coach AI personal yang mengambil data langsung dari Intervals.icu via MCP.

---

## Skills Fondasi (Knowledge & Methodology)

### 1. `running-coach-analysis`
**Tujuan**: Master skill coaching lari — evaluasi eksekusi, fisiologis, profil atlet, zona daya/HR, protokol pemulihan, dan rekomendasi sesi berikutnya (termasuk format Teks DSL Workout Builder).  
**File**: [`skills/running-coach-analysis/SKILL.md`](skills/running-coach-analysis/SKILL.md)

**Yang perlu dikonfigurasi:**
- **Bagian 2 — Profil Atlet**: Nama, usia, perangkat, status kompetisi, filosofi latihan, dan matriks rotasi sepatu.
- **Bagian 3 — Power Zones & HR Zones**: Sesuaikan rentang zona dengan CP dan LTHR Anda (parameter utama dibaca otomatis dari Intervals.icu).
- **Bagian 4 — Blueprint Workout**: Semua tipe sesi latihan berikut target power, HR, dan durasi spesifik.
- **Bagian 5 — Format Teks DSL**: Aturan penulisan `- 12m 70-80% power, 70-80% pace` untuk pembuat workout berstruktur.

---

### 2. `training-load-analysis`
**Tujuan**: Interpretasi beban latihan harian — CTL, ATL, TSB, ACWR (Acute:Chronic Workload Ratio), Ramp Rate, eFTP, dan Weekly Load Budgeting berbasis CTL Multiplier System (Palladino Power Project).  
**File**: [`skills/training-load-analysis/SKILL.md`](skills/training-load-analysis/SKILL.md)

**Yang perlu dikonfigurasi:**
- **Bagian 2 — CTL Multiplier System**: Alokasi beban per tipe sesi relatif terhadap CTL harian (Easy 70–90%, Moderate 100–150%, Quality 125–175%, Long Run 150–300%).
- **Bagian 3 — Konteks Program Latihan**: Fase aktif, target CTL, loading model (Blok 5 Minggu), dan threshold Fatigue Flags / ACWR.

---

## Skills Interaktif (Slash Commands)

### 1. `/run-report` — Laporan Pasca-Sesi Lari
**Tujuan**: Generate coaching report setelah setiap sesi lari.

```text
/run-report

- Hari/Tanggal: Kamis, 7 Agustus 2026
- Sesi Eksekusi: [Nama Sesi] - [Durasi] menit
- RPE (Rating of Perceived Exertion): [X]/10
- Catatan Fisik: [Catatan subjektif Anda]
```

**Yang dihasilkan:**
1. Ringkasan Eksekusi — kepatuhan target watt & durasi.
2. Analisis Detail Fisiologis — Aerobic Decoupling, Cardiac Drift, breakdown interval.
3. Key Findings — korelasi RPE & sensasi fisik dengan data numerik.
4. Rekomendasi Sesi Berikutnya — target watt, HR ceiling, durasi spesifik, & opsi penjadwalan otomatis.

---

### 2. `/fitness-status` — Status Beban Latihan & ACWR
**Tujuan**: Cek kondisi training load, evaluasi ACWR (Acute:Chronic Workload Ratio), TSB Zone, dan kesiapan atlet saat ini.

```text
/fitness-status
```

Atau dengan tanggal spesifik:
```text
/fitness-status 2026-08-08
```

**Yang dihasilkan:**
- Tabel metrik CTL, ATL, TSB, ACWR, ACWR Category, Ramp Rate, eFTP terkini.
- Evaluasi Fisiologis & Advice pencegahan cedera dari MCP tool `analyze_training_load`.
- Tren 4 minggu terakhir.
- Rekomendasi loading untuk minggu berjalan + peringatan deload jika diperlukan.

---

### 3. `/weekly-budget` — Kalkulator Budget Latihan Mingguan
**Tujuan**: Hitung budget beban latihan mingguan dan alokasi proporsi sesi aman berdasarkan 42d avg load (CTL).

```text
/weekly-budget
```

Atau dengan target ramp rate kustom (misal +3%):
```text
/weekly-budget 3
```

**Yang dihasilkan:**
- Base Weekly Load & Total Weekly Budget (+5% default ramp rate).
- Batas Long Run Cap (30–35% budget).
- Batas Quality Interval Cap (15–20% budget).
- Alokasi Easy/Recovery Run (45–55% budget).
- Panduan eksekusi alokasi per sesi lari.

---

### 4. `/create-workout` — Structured Running Workout Builder *(Baru)*
**Tujuan**: Jadwalkan planned workout berstruktur di kalender Intervals.icu atlet menggunakan Teks DSL.

```text
/create-workout

- Judul: Subthreshold I
- Tanggal: 2026-08-11
- Teks DSL:
Warmup
- 12m 70-80% power, 70-80% pace

Main Set 6x
- 3m 95-98% power, 95-98% pace
- 1m 60-75% power, 60-75% pace

Cooldown
- 6m 70-80% power, 70-80% pace
```

**Yang dihasilkan:**
- Event planned workout berstruktur langsung terkirim ke kalender Intervals.icu (otomatis sync ke jam tangan Garmin).
- Komputasi otomatis durasi total, estimasi jarak, dan Training Load (TSS).

---

### 5. `/calc-vdot` — Kalkulator VDOT & Zona Pace
**Tujuan**: Hitung VDOT dan 5 zona pace latihan dari hasil race atau threshold pace.

**Dari hasil race:**
```text
/calc-vdot

- Hasil Race: 45:30 — 10K
```

**Dari threshold pace:**
```text
/calc-vdot threshold 5:30/km
```

**Yang dihasilkan:**
- Skor VDOT + kategori level.
- Tabel 5 zona pace (Easy, Marathon, Threshold, Interval, Repetition) dalam format MM:SS/km.
- Catatan kontekstualisasi dengan program latihan Anda.

> **Catatan**: Berjalan 100% offline — tidak memerlukan koneksi ke Intervals.icu.

---

### 6. `/check-workout` — Jadwal Planned Workout
**Tujuan**: Cek daftar planned workout mendatang dari kalender Intervals.icu.

```text
/check-workout
```

Atau dengan rentang tanggal:
```text
/check-workout 2026-08-08 2026-08-15
```

Atau untuk detail satu workout:
```text
/check-workout id [event_id]
```

**Yang dihasilkan:**
- Tabel jadwal workout beserta target power/HR/pace yang sudah di-resolve berdasarkan profil aktif.
- Verifikasi kesesuaian jadwal dengan blueprint program latihan.

---

### 7. `/backcast-plan` — Backward Planning Macrocycle
**Tujuan**: Menyusun jadwal makrosiklus latihan secara terbalik dari tanggal Race Day (HM/FM).

```text
/backcast-plan 2026-10-18 HM
```

**Yang dihasilkan:**
- Tanggal wajib mulai (Week 1 Start Date).
- Pembagian 4 Blok Latihan (General Base, Specific Build, Peak Volume, Tapering).
- Alokasi volume dan jenis Long Run per blok.

---

### 8. `/mesocycle-block` — 5-Week Double Build Mesocycle Planner
**Tujuan**: Merencanakan alokasi 1 blok mesosiklus (5 minggu) dengan model Double Build Coach Faris Salman (W1 Baseline → W2-3 Build +3–5% → W4 Deload -10% dari Baseline → W5 New Baseline) dan CTL Multiplier System.

```text
/mesocycle-block load
```
atau berbasis jarak:
```text
/mesocycle-block distance
```

**Yang dihasilkan:**
- Matriks alokasi W1 Baseline (0%), W2 Build (+3–5%), W3 Build (+3–5%), W4 Deload (-10% dari W1), dan W5 New Baseline (+3%).
- Distribusi alokasi beban per tipe sesi berbasis CTL Multiplier (Easy 70–90%, Moderate 100–150%, Quality 125–175%, Long Run 150–200% CTL).
- Safeguard Sesi Tunggal (Single Run Safeguard vs 30-day max TSS).

---

### 9. `/readiness-check` — Daily Recovery & Readiness Score
**Tujuan**: Evaluasi skor kesiapan harian komposit (0–100%) berbasis TSB, ACWR, Sleep Score, dan RHR Spike via MCP `calculate_readiness_score`.

```text
/readiness-check
```

**Yang dihasilkan:**
- Unified Readiness Score (0–100) dan status kesiapan: 🟢 GREEN (≥80%), 🟡 YELLOW (50–79%), 🔴 RED (<50%).
- Rincian kontribusi poin: Kesiapan Akut (TSB), Rasio Beban (ACWR), dan Kualitas Tidur & Pemulihan (Wellness).
- Panduan eksekusi sesi hari ini yang aman dari overtraining.

---

### 10. `/predict-race` — Race Prediction & Tapering Plan
**Tujuan**: Estimasi waktu finish lomba (5K, 10K, Half Marathon, Full Marathon) dan generator jadwal tapering 2–3 minggu berbasis VDOT, CTL, & TSB via MCP `predict_race_time` dan `calculate_taper_plan`.

```text
/predict-race
```

**Yang dihasilkan:**
- Estimasi waktu finish dan target pace rata-rata (disesuaikan dengan CTL dan TSB terkini).
- Jadwal tapering mingguan: pemotongan volume (-35%), target TSB fresh (+5 s.d. +15), dan panduan eksekusi.
- Rekomendasi pacing strategy dan simulasi nutrisi/hidrasi race day.

---

### 11. `/cardiac-drift` — Aerobic Decoupling & Cardiac Drift Analysis
**Tujuan**: Analisis penurunan efisiensi aerobik (*aerobic decoupling*) dan drift detak jantung dari stream telemetri aktivitas lari/sepeda via MCP `analyze_cardiac_drift`.

```text
/cardiac-drift
```

**Yang dihasilkan:**
- Efficiency Factor (EF) paruh 1 vs paruh 2 (Watt/bpm atau Speed/bpm).
- Nilai Decoupling (%) dan klasifikasi: `< 3%` (Sangat Solid), `3–5%` (Terkendali), `> 5%` (Cardiac Drift Signifikan).
- Analisis korelasi fisiologis (hidrasi, suhu, akumulasi fatigue).

---

## Cara Menggunakannya

### 1. Konfigurasi Skills

Buka setiap file `SKILL.md` di folder `skills/` dan sesuaikan profil atau target Anda jika diperlukan.

### 2. Sambungkan ke Antigravity

Buka percakapan Antigravity dengan workspace di folder project ini. Seluruh **13 Skills** (2 fondasi + 11 slash commands interaktif) akan otomatis terdeteksi:
- Fondasi: `running-coach-analysis`, `training-load-analysis`
- Slash Commands: `/run-report`, `/fitness-status`, `/weekly-budget`, `/create-workout`, `/calc-vdot`, `/check-workout`, `/backcast-plan`, `/mesocycle-block`, `/readiness-check`, `/predict-race`, `/cardiac-drift`

### 3. Pastikan MCP Intervals.icu Aktif

Konfigurasi MCP server `intervals-icu` di file `antigravity.json` Anda:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["./dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key",
        "INTERVALS_ATHLETE_ID": "your_athlete_id"
      }
    }
  }
}
```

---

## Apa yang Dibutuhkan

- [Antigravity](https://antigravity.dev) dengan MCP `intervals-icu` terkonfigurasi
- Intervals.icu account dengan data aktivitas Power (running power meter)
- API Key dari Intervals.icu (Settings → Developer Settings)
