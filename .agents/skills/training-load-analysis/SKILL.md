---
name: training-load-analysis
description: Skill interpretasi beban latihan berbasis sains (CTL, ATL, TSB, ACWR, Ramp Rate, eFTP, Weekly Budget) dari Intervals.icu. Menghubungkan data fitness chart dengan konteks periodisasi dan kondisi kesiapan atlet untuk menghasilkan analisis training load yang akurat.
---

# Training Load Analysis Skill

Skill ini digunakan untuk menganalisis kondisi beban latihan harian atlet berdasarkan data fitness chart (CTL/ATL/TSB/ACWR) dan kalkulasi budget mingguan dari **Intervals.icu MCP**.

---

## 1. Definisi Metrik Utama & Fisiologi Latihan

### Chronic Training Load (CTL) — "Fitness"
- **Definisi**: Rata-rata beban latihan 42 hari terakhir (eksponensial moving average). Representasi kebugaran kardiovaskular jangka panjang.
- **Interpretasi Umum**:
  - **CTL < 40**: Base building — fondasi aerobik sedang dibangun.
  - **CTL 40–60**: Aerobic development fase aktif — zona produktif untuk sebagian besar pelari.
  - **CTL 60–80**: High fitness — monitoring ekstra diperlukan.
  - **CTL > 80**: Elite zone — biasanya dicapai pelari semi-profesional atau profesional.

> [!IMPORTANT]
> **Sesuaikan rentang CTL ini dengan program dan level atlet Anda.** Target CTL berbeda antara pelari pemula, recreational, dan competitive.

### Acute Training Load (ATL) — "Fatigue"
- **Definisi**: Rata-rata beban latihan 7 hari terakhir. Representasi akumulasi kelelahan jangka pendek.
- **ATL > CTL + 20**: Kelelahan akut berlebih — risiko overtraining atau cedera.
- **ATL < CTL - 10**: Deload / undertraining — tubuh sangat pulih, siap menerima load lebih tinggi.

### Training Stress Balance (TSB) — "Form / Freshness"
- **Formula**: `TSB = CTL - ATL`
- **Interpretasi**:
  - `TSB > +25`: Transition / Recovery Panjang.
  - `TSB +5 – +25`: Fresh & Race Ready — ideal untuk race / testing.
  - `TSB -10 – +5`: Grey Zone — transisi atau pemeliharaan.
  - `TSB -30 – -10`: Optimal Training Zone — zona latihan produktif, adaptasi terjadi.
  - `TSB < -30`: High Risk / Overstressed — wajib deload/istirahat segera.

### Acute:Chronic Workload Ratio (ACWR) — "Injury Risk Indicator"
- **Formula**: `ACWR = ATL / CTL` (Dihitung via MCP tool `analyze_training_load`)
- **Interpretasi Zone**:
  - `< 0.8`: **Under-training** (Penurunan kebugaran / detraining risk).
  - `0.8 – 1.3`: **Sweet Spot** (Sangat Aman & Produktif — Risiko cedera terendah).
  - `1.3 – 1.5`: **Warning Zone** (Spike beban cepat — Pengawasan ketat pada recovery & tidur).
  - `> 1.5`: **Danger Zone** (Risiko tinggi cedera & overtraining — Wajib kurangi beban / Easy runs saja).

### Ramp Rate (RR)
- **Definisi**: Kenaikan CTL per minggu.
- **Kategorisasi Status**:
  - `< 0`: Taper / Non-Productive
  - `0.0 – 1.0`: Minimal Build
  - `1.0 – 3.0`: Sweetspot (Kenaikan bertahap ideal)
  - `3.0 – 5.0`: High Build (Batas atas aman)
  - `> 5.0`: High Risk (Warning berisiko cedera)

### eFTP (Estimated FTP)
- **Definisi**: Estimasi FTP terkini berdasarkan data kinerja aktual dari aktivitas terbaru.
- Gunakan sebagai validasi terhadap FTP baseline.

---

## 2. Weekly Load Budgeting & Alokasi Sesi

Berdasarkan data CTL (42-day average daily load), hitung budget latihan mingguan menggunakan MCP tool `calculate_weekly_budget`:

- **Base Weekly Load**: `CTL × 7`
- **Target Ramp Pct**: Default +5% per minggu (Batas aman pembangunan beban).
- **Total Weekly Budget**: `Base Weekly Load × (1 + targetRampPct%)`

### Aturan Proporsi Beban Sesi Mingguan (Strict Caps)
1. **Long Run Cap**: **30–35%** dari Total Weekly Budget.
2. **Quality Interval Cap**: **15–20%** dari Total Weekly Budget.
3. **Easy & Recovery Allocation**: **45–55%** dari Total Weekly Budget.

---

## 3. Konteks Program Latihan Atlet

> [!IMPORTANT]
> **Sesuaikan bagian ini dengan program latihan dan fase periodisasi Anda.** Tentukan target CTL, TSB alert threshold, dan loading model (misal: 3:1, 4:1, atau 2:1 build:recovery ratio).

- **Fase Aktif**: `[Nama Fase, contoh: Base Building / Aerobic Development / Race Prep]`
- **Target CTL Ideal**: `[X – Y]` (zona produktif untuk program Anda)
- **Loading Model**: `[Contoh: 3 minggu build → 1 minggu deload]`
- **Fatigue Flags**:
  - ACWR > 1.5 ATAU TSB < threshold kritis → Aktifkan Protokol Deload.
  - Ramp Rate > +5.0/minggu → Kurangi intensitas workout.

---

## 4. Workflow Pengambilan & Kalkulasi Data dari MCP

1. **`get_fitness_chart`**:
   - Parameter: `startDate` (90 hari lalu), `endDate` (hari ini).
   - `cols`: `ctl,atl,tsb,rampRate,eftp`
   - Ambil data CTL, ATL, TSB, Ramp Rate, dan eFTP terkini.

2. **`analyze_training_load`**:
   - Input: `ctl`, `atl`, `tsb`, `rampRate` dari langkah 1.
   - Ekstrak: `acwr`, `acwrCategory`, `tsbZone`, `rampRateStatus`, `advice`.

3. **`calculate_weekly_budget`**:
   - Input: `avgDailyLoad` (= CTL), `targetRampPct: 5`.
   - Ekstrak: `totalWeeklyBudget`, `longRunMin`–`longRunMax`, `qualityIntervalMin`–`qualityIntervalMax`, `easyRunMin`–`easyRunMax`.

4. **`get_wellness_data`** (Triangulasi):
   - Ambil `restingHR`, `hrv`, `sleepScore`, `weight`.

---

## 5. Format Respons Wajib — Training Load & Budget Report

```markdown
### Status Beban Latihan & Kesiapan Terkini

**Tanggal**: [Tanggal]

| Metrik | Nilai | Status & Zona |
|---|---|---|
| CTL (Fitness) | [X] | [Low/Building/Good/High] |
| ATL (Fatigue) | [X] | [Low/Moderate/High] |
| TSB (Form)    | [X] | [Zone: Transition/Fresh/Grey/Optimal/High Risk] |
| ACWR (Workload Ratio) | [X.XX] | **[Under-training/Sweet Spot/Warning/Danger]** |
| Ramp Rate     | [X]/minggu | [Taper/Minimal/Sweetspot/High Build/High Risk] |
| eFTP          | [X] W | [vs. FTP baseline] |

**Evaluasi Fisiologis**: [Catatan dari advice analyze_training_load]

### Budget & Proporsi Latihan Minggu Ini (Target +5% Ramp)
- **Base Weekly Load**: [CTL × 7] Load
- **Total Weekly Budget**: **[Total Budget] Load**
- **Long Run Cap (30–35%)**: [Min]–[Max] Load
- **Quality Interval Cap (15–20%)**: [Min]–[Max] Load
- **Easy / Recovery Allocation (45–55%)**: [Min]–[Max] Load

**Rekomendasi Eksekusi**:
- [Apakah beban aman untuk lanjut build / perlu adjustment]
- [Kesesuaian jadwal dengan Quality Cap]
```

---

## 6. Panduan Deload (Jika Diperlukan)

Jika ACWR > 1.5 atau TSB < threshold kritis:
1. Kurangi intensitas sesi workout → ganti ke easy aerobic.
2. Pertahankan frekuensi lari (jangan stop total).
3. Evaluasi ulang setelah 5–7 hari recovery.