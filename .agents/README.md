# Running Coach AI — Panduan Konfigurasi (Norwegian Singles Edition)

Folder `.agents/` berisi konfigurasi **Antigravity Agent** (skills & rules) untuk membangun Running Coach AI personal berbasis **Norwegian Singles Training Method** (`docs/references/norwegian-singles/`) yang mengambil data langsung dari Intervals.icu via MCP.

---

## Skills Fondasi (Master Knowledge & Methodology)

### 1. `running-coach-analysis`
**Tujuan**: Master skill fisiologi coaching lari — evaluasi kontrol ambang laktat (*sub-threshold LT2*), disiplin batas atas daya/HR, profil atlet, rotasi sepatu, reassurance target Half Marathon (§5.1), dan protokol pemulihan lumbar (McGill Big 3).  
**File**: [`skills/running-coach-analysis/SKILL.md`](skills/running-coach-analysis/SKILL.md)

**Isi Konfigurasi Utama:**
- **Profil Fisiologis Dinamis**: Parameter CP, LTHR, Max HR, dan RHR diekstrak secara dinamis via MCP Intervals.icu.
- **Protokol Iklim Tropis / Cuaca Panas**: Evaluasi berbasis *running power* sebagai kontrol primer, HR sebagai monitor sekunder (toleransi kenaikan HR wajar di suhu hangat/lembab) + **Fallback Cuaca Ekstrem (§4.2)**: RPE (5–6/10) menjadi acuan utama jika stres termal mendistorsi HR.
- **Strength Training & Stabilitas Core (§4.7)**: Latihan penguatan stabilitas core direkomendasikan ringan tanpa menambah kelelahan sistemik pada sesi lari.
- **Reassurance HM (§5.1)**: Jarak 5K–HM adalah *sweet spot* utama NSA, cukup Long Run 75–90m pure easy tanpa simulasi maraton berat.
- **Matriks Rotasi Sepatu**: Contoh rotasi 4 kategori sepatu (Race Super Shoe, Speed Trainer, Daily Cushioned, Max Cushion Recovery).
- **Pola Mingguan NSA**: `E-Q-E-Q-E-Q-LR` (atau adaptasi 2-Q untuk volume rendah).

---

### 2. `training-load-analysis`
**Tujuan**: Interpretasi beban latihan berkelanjutan (*sustainable load*) — CTL, ATL, TSB, ACWR, Ramp Rate, eFTP, kalibrasi berkala race/TT (§2.4, §4.3), timeline adaptasi (§4.4), dan audit alokasi waktu mingguan (Aturan 20–25% Sub-T dan 75–80% Easy).  
**File**: [`skills/training-load-analysis/SKILL.md`](skills/training-load-analysis/SKILL.md)

**Isi Konfigurasi Utama:**
- **Sustainable CTL**: Menjaga beban dalam *Green Zone* yang dapat diulang terus-menerus tanpa kelelahan kronis.
- **Aturan Durasi 75/25**: 20–25% durasi kerja Sub-T per minggu, 75–80% durasi Easy Run (< 70% Max HR).
- **Kalibrasi Race/TT Berkala (§2.4, §4.3)**: Anjuran race/TT tiap 4–8 minggu untuk pembaruan acuan, stimulasi neuromuskular, dan mitigasi *racing rust*; reminder jika kalibrasi $>8$ minggu.
- **Timeline Adaptasi (§4.4)**: Adaptasi awal butuh 4–8 minggu, breakthrough nyata setelah 3–6+ bulan konsistensi; stagnasi semu itu wajar.
- **Deteksi Kelelahan Adaptif**: Evaluasi 4 Red Flags (RHR spike > 5 bpm, kualitas tidur buruk 2 malam, CNS fatigue, easy pace terasa berat).

---

## Skills Interaktif (13 Slash Commands)

### 1. `/plan-week` — Norwegian Singles Weekly Planner
**Tujuan**: Merancang dan menerbitkan jadwal latihan 1 pekan penuh berstruktur (`E-Q-E-Q-E-Q-LR`) secara deterministik berbasis aturan durasi 75/25 NSA, lengkap dengan pratinjau tabel dan penerbitan satu-klik ke kalender Intervals.icu via `generate_weekly_plan` dan `create_running_workout`.
```text
/plan-week
/plan-week 6h
/plan-week 2026-09-21 6h
```

---

### 2. `/calc-nsa` — Matriks Interval Norwegian Singles (Time-Based)
**Tujuan**: Menghitung matriks interval berbasis durasi resmi NSA (1m s.d. 15m) yang dipersonalisasi ke pace dan target watt atlet via MCP `calculate_nsa_matrix` (§2.2).
```text
/calc-nsa
```

---

### 3. `/weekly-budget` — Kalkulator Alokasi Durasi Mingguan
**Tujuan**: Menghitung alokasi waktu latihan mingguan (5–9 jam/minggu) split 75/25 waktu, aturan progresi pemula 2-Q (§2.3, §2.4), serta **Dua Guardrail Terpisah NSA (§6.2)**: (a) batas 8–9 jam dengan *easy double runs*, (b) batas waktu kerja Sub-T maks 40–50 menit atau 10–12 km per sesi di semua level volume.
```text
/weekly-budget
```
atau dengan target durasi kustom:
```text
/weekly-budget 6h
```

---

### 4. `/create-workout` — Norwegian Singles Workout Builder
**Tujuan**: Menerbitkan planned workout terstruktur (time-based & distance-based sub-T, easy runs, pure aerobic long run 75–90m) ke kalender Intervals.icu via Teks DSL, dengan validasi guardrail waktu kerja Sub-T maks 40–50 menit per sesi (§6.2).
```text
/create-workout
```

---

### 5. `/check-workout` — Jadwal Planned Workout
**Tujuan**: Cek daftar planned workout mendatang dari kalender Intervals.icu berikut target watt, durasi, dan HR yang ter-resolve.
```text
/check-workout
```

---

### 6. `/run-report` — Laporan Pasca-Sesi Lari
**Tujuan**: Evaluasi kepatuhan atlet terhadap batas atas intensitas LT2 (85–95% CP, laktat 2.0–3.0 mmol/L), kepatuhan istirahat pasif pendek (30–60s), dan status pemulihan, dengan fallback cuaca ekstrem (§4.2) yang memprioritaskan RPE jika stres termal mendistorsi HR.
```text
/run-report

- Hari/Tanggal: Selasa, 15 September 2026
- Sesi Eksekusi: Short Sub-Threshold 10x3m - 55 menit
- RPE (Rating of Perceived Exertion): 6/10
- Catatan Fisik: Nyaman, napas terkontrol
```

---

### 7. `/fitness-status` — Status Beban Latihan & Green Zone Audit
**Tujuan**: Evaluasi kebugaran berkelanjutan (CTL), kelelahan akut (ATL), kesiapan (TSB), ACWR (0.8–1.3 sweetspot), dan deteksi dini sinyal kelelahan (*Green Zone check*).
```text
/fitness-status
```

---

### 8. `/readiness-check` — Daily Recovery & Readiness Score
**Tujuan**: Evaluasi kesiapan harian komposit (0–100% Green/Yellow/Red) berbasis TSB, ACWR, Sleep Score, dan RHR spike via MCP `calculate_readiness_score`. Dilengkapi **Flag 5 (Musculoskeletal Guardrail)** dengan protokol cross-training (sepeda/elliptical) menjaga volume saat pemulihan cedera (§4.9).
```text
/readiness-check
```

---

### 9. `/cardiac-drift` — Aerobic Decoupling & Drift Jantung
**Tujuan**: Analisis penurunan efisiensi aerobik (*Efficiency Factor* H1 vs H2) dari stream data telemetri aktivitas via MCP `analyze_cardiac_drift`.
```text
/cardiac-drift
```

---

### 10. `/calc-vdot` — Kalkulator VDOT & Ambang Sub-Threshold
**Tujuan**: Menghitung skor VDOT offline dan zona pace sub-threshold (10k, 15k, HM, 30k) serta Easy Run dari hasil race/time-trial untuk kalibrasi reguler tiap 4–8 minggu (§2.4, §4.3).
```text
/calc-vdot
- Hasil Race: 24:30 — 5K
```

---

### 11. `/predict-race` — Race Prediction & 10–14 Day Tapering Plan
**Tujuan**: Proyeksi waktu finish race berbasis VDOT + CTL, jadwal *A-Taper* (pemotongan volume ke 75% lalu 50% dengan frekuensi lari tetap), reassurance jarak 5K–HM sebagai sweet spot NSA (§5.1), dan pengingat usia kalibrasi VDOT $>8$ minggu (§2.4, §4.3).
```text
/predict-race
```

---

### 12. `/race-strategy` — Race Day & Fueling Execution Planner
**Tujuan**: Rencana eksekusi hari perlombaan menyeluruh: pacing split berbasis batas Critical Power (% CP), jadwal konsumsi energy gel EJ Sport (30g carb, 12g Maltodextrin + 18g Dextrose), strategi hidrasi iklim tropis, serta panduan perlengkapan (sepatu super carbon/nylon plate).
```text
/race-strategy
```

---

### 13. `/strength-guide` — Functional Strength & Spinal Stability for Runners
**Tujuan**: Panduan sesi latihan kekuatan fungsional 20–25 menit pelari berbasis kerangka kerja Steve Magness (Movement Prep, Heavy Neural, Power, Plyos) dan protokol stabilitas tulang belakang via **McGill Big 3**. Dijalankan pada hari Quality (Selasa & Jumat sore) mematuhi prinsip *"Hard Days Hard, Easy Days Easy"*.
```text
/strength-guide
/strength-guide taper
/strength-guide mcgill
```

---

## Cara Menggunakannya

1. Buka percakapan Antigravity di folder project ini. Seluruh **15 Skills** (13 Slash Commands + 2 Master Knowledge Skills) akan otomatis terdeteksi.
2. Pastikan konfigurasi MCP server `intervals-icu` telah aktif di Antigravity.
3. Gunakan slash command yang sesuai dengan rutinitas harian dan mingguan latihan Anda.
