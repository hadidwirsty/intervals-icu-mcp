---
name: run-report
description: Otomasi analisis laporan sesi lari harian atlet dengan mengambil data langsung dari Intervals.icu via MCP dan menghasilkan coaching report presisi berbasis Norwegian Singles Training Method.
---

# Skill: `/run-report` — Post-Run Coaching Analysis

Skill ini digunakan untuk menghasilkan **Analisis Pasca-Sesi Lari Komprehensif** secara otomatis dengan mengambil telemetri aktivitas dan wellness dari Intervals.icu via MCP, berlandaskan prinsip baku **Norwegian Singles Training Method** (`docs/references/norwegian-singles/`).

---

## 1. Format Prompt Penggunaan

Atlet/User cukup memberikan informasi sesi dengan format:

```text
/run-report

- Hari/Tanggal: [Hari, DD Bulan YYYY] (contoh: Selasa, 15 September 2026)
- Sesi Eksekusi: [Nama Sesi & Durasi Target] (contoh: Short Sub-Threshold 10x3m - 55 menit)
- RPE (Rating of Perceived Exertion): [Skala 1-10]/10
- Catatan Fisik: [Sensasi fisik, kondisi cuaca, atau catatan tambahan]
```

---

## 2. Langkah Eksekusi Sistem

### Step 1: Parse Input User
Ekstrak parameter berikut dari pesan user:
- `tanggal`: Tanggal eksekusi sesi (format `YYYY-MM-DD`).
- `sesi_target`: Nama dan target durasi sesi.
- `rpe`: Tingkat RPE yang dilaporkan atlet (skala 1–10).
- `catatan_fisik`: Catatan subjektif atlet.

---

### Step 2: Fetch Data dari MCP Intervals.icu

1. **`get_activities`**:
   - `startDate` & `endDate`: Tanggal sesi (`YYYY-MM-DD`).
   - Temukan aktivitas lari (`type == "Run"`) yang sesuai. Catat `id` aktivitas.
2. **`get_activity_details`**:
   - `activity_id`: `id` dari langkah 1.
   - Ambil metrik: `icu_average_watts`, `icu_weighted_avg_watts`, `average_heartrate`, `max_heartrate`, `moving_time`, `elapsed_time`, `icu_training_load`, `average_cadence`, `decoupling`.
   - Ekstrak baseline aktif: `icu_ftp` (CP), `icu_w_prime`, `lthr`, `athlete_max_hr`, `icu_resting_hr`, `icu_weight`.
3. **`get_wellness_data`**:
   - Parameter: `startDate` & `endDate` tanggal sesi.
   - Ambil data: `weight`, `restingHR`, `hrv`, `sleepScore`, `ctl`, `atl`.
4. **`get_activity_intervals`**:
   - Ambil rincian per putaran/lap (Warmup, Work Reps, Recovery, Cooldown).
5. **`get_activity_streams`**:
   - `keys`: `["watts", "heartrate", "cadence", "velocity_smooth"]`.
   - Hitung efisiensi paruh pertama vs paruh kedua via tool `analyze_cardiac_drift`.

---

### Step 3: Evaluasi Kepatuhan Prinsip Norwegian Singles

Terapkan aturan evaluasi dari `.agents/skills/running-coach-analysis/SKILL.md`:

#### A. Khusus Sesi Sub-Threshold (Quality Days):
- **Prinsip Utama [Sumber: NSA]**: *"Never race your workouts"*. Sesi sub-threshold harus terasa *comfortably hard* (RPE 5–6/10), atlet harus selalu merasa masih sanggup melakukan 1–2 repetisi lagi.
- **4 Kriteria Evaluasi Kepatuhan Sub-T (Compliance Score)**:
  1. **Disiplin Batas Atas Power**: Avg Watts per repetisi berada di koridor 85–95% CP. Tidak boleh melompat ke zona VO₂max (> 104% CP).
  2. **Ceiling HR Terjaga**: HR tidak menembus batas ambang laktat (< LTHR atau < 90–92% Max HR).
  3. **Cardiac Drift Rendah (< 5%)**: Aerobic Decoupling paruh 1 vs paruh 2 terkendali di bawah 5%.
  4. **Rest Interval**: Jeda istirahat antar repetisi berupa berjalan santai, berdiri, atau jogging pelan (30–60 detik per NSA §2.2). Nilai berdasarkan apakah jeda cukup pasif untuk memulihkan laktat.
- **Catatan Cuaca Panas/Lembap Ekstrem [Sumber: NSA §4.2]**: Jika `catatan_fisik` menyebutkan kondisi cuaca sangat panas atau kelembapan ekstrem (suhu $>30^\circ\text{C}$ / RH $>85\%$), prioritaskan **RPE atlet (target 5–6/10 "comfortably hard")** dibanding angka HR mentah. Jangan otomatis menandai kegagalan semata-mata karena lonjakan HR akibat stres termal jika intensitas usaha internal tetap terjaga di bawah LT2.
- **Skor**: 🟢 Hijau = 4/4 Kepatuhan Penuh | 🟡 Kuning = 2–3/4 | 🔴 Merah = < 2/4 (melanggar batas sub-threshold / overcooked).

#### B. Khusus Sesi Easy & Recovery Run:
- **Kontrol Primer (Power)**: Average Watts $\le$ 77% CP.
- **Kontrol Sekunder (Heat-Adjusted HR)**:
  - Suhu normal (< 20°C): Avg HR $\le$ 70% Max HR.
  - Suhu tropis hangat (20–28°C): Avg HR $\le$ 74% Max HR $\rightarrow$ ✅ **OK (Tropical/Heat Adjusted)** selama Power $\le$ 77% CP.
  - Power $\le$ 77% CP tetapi HR > 74% Max HR $\rightarrow$ 🟡 **Warning: Potensi Dehidrasi / Kelelahan Termal**.
  - Power > 77% CP $\rightarrow$ 🔴 **Easy Run Too Fast** (teguran keras karena merusak pemulihan).
- **Catatan Cuaca Ekstrem [Sumber: NSA §4.2]**: Jika cuaca sangat panas/lembap, evaluasi sesi wajib memprioritaskan **RPE atlet (skala 2–3/10 conversational)**.

#### C. Biomekanika & Disiplin Easy Run:
- **Kadens**: Rata-rata terjaga $\ge$ 170–175 rpm untuk efisiensi mekanis dan peredaman impak sendi.
- **Pace Realism**: Lari santai bertujuan memulihkan sistem saraf dan kapasitas aerobik murni. Dilarang memaksakan pace kencang di hari Easy Run.

---

### Step 4: Format Respons Laporan Coaching Report

Gunakan format baku 4 bagian dari skill `running-coach-analysis`:
1. **Ringkasan Eksekusi**
2. **Analisis Detail Fisiologis** (EF, Decoupling, Respons HR, Breakdown Lap)
3. **Key Findings (Norwegian Singles Evaluation)**
4. **Rekomendasi Sesi Berikutnya & Protokol Pemulihan**