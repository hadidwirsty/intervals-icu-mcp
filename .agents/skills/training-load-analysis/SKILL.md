---
name: training-load-analysis
description: Skill interpretasi beban latihan berbasis sains (CTL, ATL, TSB, ACWR, Ramp Rate, eFTP, Weekly Budget) dari Intervals.icu. Menghubungkan data fitness chart dengan konteks periodisasi dan kondisi kesiapan atlet menggunakan CTL Multiplier System (Palladino Power Project) untuk menghasilkan analisis training load yang akurat.
---

# Training Load Analysis Skill

Skill ini digunakan untuk menganalisis kondisi beban latihan harian atlet berdasarkan data fitness chart (CTL/ATL/TSB/ACWR) dan kalkulasi budget mingguan dari **Intervals.icu MCP**, dengan menggunakan **CTL Multiplier System dari Palladino Power Project**.

---

## 1. Definisi Metrik Utama & Fisiologi Latihan

### Chronic Training Load (CTL) — "Fitness"
- **Definisi**: Rata-rata beban latihan 42 hari terakhir (eksponensial moving average). Representasi kebugaran kardiovaskular jangka panjang.
- **Catatan Penting**: Dalam ekosistem Stryd / Intervals.icu, **1× CTL ≈ 42-day Average Daily Load**. Semua kalkulasi multiplier per sesi di bawah ini menggunakan CTL sebagai referensi beban harian atlet.
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

### Ramp Rate (RR) — Standar Resmi Palladino Power Project
- **Definisi**: Kenaikan CTL per minggu (TSS/minggu).
- **Kategorisasi Status (Palladino Power Project)**:

| Status / Tujuan | Ramp Rate (TSS/minggu) | Keterangan |
|---|---|---|
| **Minimal Build** | `> 0 s.d. < +1` | Progres lambat, fase adaptasi awal |
| **CTL Build — Sweetspot** ⭐ | **`+1 s.d. +3`** | **Rekomendasi standar mayoritas pelari** |
| **Resilient Runners Build** | `> +3 s.d. +5` | Untuk pelari sangat adaptif / berpengalaman |
| **High Risk (Not Recommended)** | `> +5` | Risiko cedera tinggi, hanya bertahan jangka pendek |
| **"A" Race Taper** | Negatif selama 1–5 hari | Pelepasan fatigue total jelang Race Utama |
| **"B" Race Taper** | `0 s.d. +1` | Maintenance ringan jelang Tune-up race |
| **Non-productive / Declining** | Negatif > 5 hari berturut-turut | Fitness mulai terdegradasi |

> [!TIP]
> **Default target ramp rate**: `+1 s.d. +3 TSS/minggu` (bukan +5%). Kenaikan agresif > +5 hanya diperbolehkan untuk pelari berpengalaman dalam periode singkat.

### eFTP (Estimated FTP)
- **Definisi**: Estimasi FTP terkini berdasarkan data kinerja aktual dari aktivitas terbaru.
- Gunakan sebagai validasi terhadap FTP baseline.

---

## 2. CTL Multiplier System — Alokasi Beban per Tipe Sesi

> [!IMPORTANT]
> Gantikan model proporsi persentase kaku (% dari total mingguan) dengan **CTL Multiplier System**. Setiap sesi dialokasikan berdasarkan beban relatif terhadap CTL harian atlet, bukan persentase dari total mingguan.

### Matriks Alokasi Beban (% CTL per Sesi)

| Tipe Sesi | Range Beban (% CTL) | Nilai Tipikal (% CTL) | Batasan & Keterangan |
|---|---|---|---|
| **Easy Aerobic / Recovery Run** | `< 100%` CTL | **70% – 90% CTL** | Durasi wajib **≤ 60 menit**, intensitas ≤ 80% CP/FTP, lolos talk test |
| **Moderate "Aerobic" Run** | `100% – 130%` CTL | **100% – 130% CTL** | Steady aerobic mid-week, durasi lebih panjang, tetap aerobik |
| **Interval / Tempo Session** *(inc. W/U & C/D)* | `> 100%` CTL | **125% – 175% CTL** (maks 2.5× CTL sesi khusus) | Sesi kualitas (VO₂max, Threshold, Subthreshold) |
| **Long Run (LR)** | `> 150%` CTL | **150% – 300% CTL** | HM: ~150–200%, FM: ~300% CTL |
| **Double Day** *(Quality + Quality, kasus khusus)* | `> 200%` CTL | **210% – 230% CTL** | Hanya untuk pelari high-CTL; cth AM Interval + PM Tempo |

### Aturan Easy Run — Cap Wajib
- **Durasi cap**: Maksimal **60 menit** per sesi Easy Run.
- **TSS cap**: Wajib `< 100% CTL` (biasanya 70–90% CTL).
- **Ketika CTL naik dan butuh positive ramp**: Jangan tambah durasi Easy Run. Alokasikan kenaikan beban ke **Quality Days** (Interval, Tempo, Long Run).

---

## 3. Safeguard "Excessive Single Run" (Palladino / Frandsen et al. 2025)

Untuk mencegah lonjakan beban sesi tunggal yang ekstrem, gunakan safeguard berikut:

$$\text{Single Run Risk} = \frac{\text{TSS Sesi Hari Ini}}{\text{30-Day Maximum TSS Sesi}} \times 100\%$$

| Rasio vs 30-Day Max TSS | Kategori Risiko | Tindakan |
|---|---|---|
| **< 105%** | 🟢 **Lower Risk** | Aman, lanjutkan sesuai rencana |
| **105% – 109%** | 🟡 **Modest Risk** | Monitor pemulihan lebih ketat |
| **110% – 114%** | 🟠 **Moderate Risk** | Pertimbangkan kurangi durasi/intensitas |
| **≥ 115%** | 🔴 **High Risk** | Wajib potong — risiko cedera tinggi |

---

## 4. Blok Periodisasi 5 Minggu (Coach Faris Salman)

Model mesosiklus yang digunakan adalah **Blok 5 Minggu (Double Build)**, bukan 3:1 klasik:

| Minggu | Fase | Load Modifier | Keterangan |
|---|---|---|---|
| **W1** | Baseline | `0%` | Titik referensi awal blok |
| **W2** | Build | `+3% – +5%` dari W1 | Kenaikan volume progresif |
| **W3** | Build | `+3% – +5%` dari W2 | Kenaikan volume progresif |
| **W4** | Deload | **`−10% dari W1 (Baseline)`** | *Unloading week* terkontrol (bukan -25% dari peak!) |
| **W5** | New Baseline | Sedikit di atas W1 | Menjadi titik referensi blok berikutnya |

> [!WARNING]
> Deload hanya **-10% dari Baseline (W1)**, BUKAN -25% dari Peak (W3). Ini menjaga *neuromuscular tone* dan *aerobic stimulus* tetap aktif selama deload.

---

## 5. Konteks Program Latihan Atlet

> [!IMPORTANT]
> **Sesuaikan bagian ini dengan program latihan dan fase periodisasi Anda.** Tentukan target CTL, TSB alert threshold, dan model loading yang digunakan.

- **Fase Aktif**: `[Nama Fase, contoh: Phase 1 Base+Speed / Phase 2 LT Development / Phase 3 Race Specific]`
- **Target CTL Ideal**: `[X – Y]` (zona produktif untuk program Anda)
- **Loading Model**: Blok 5 Minggu (W1 Baseline → W2-3 Build → W4 Deload → W5 New Baseline)
- **Fatigue Flags**:
  - ACWR > 1.5 ATAU TSB < threshold kritis → Aktifkan Protokol Deload.
  - Ramp Rate > +5.0 TSS/minggu → Kurangi intensitas workout.

---

## 6. Workflow Pengambilan & Kalkulasi Data dari MCP

1. **`get_fitness_chart`**:
   - Parameter: `startDate` (90 hari lalu), `endDate` (hari ini).
   - `cols`: `ctl,atl,tsb,rampRate,eftp`
   - Ambil data CTL, ATL, TSB, Ramp Rate, dan eFTP terkini.

2. **`analyze_training_load`**:
   - Input: `ctl`, `atl`, `tsb`, `rampRate` dari langkah 1.
   - Ekstrak: `acwr`, `acwrCategory`, `tsbZone`, `rampRateStatus`, `advice`.

3. **`calculate_weekly_budget`**:
   - Input: `avgDailyLoad` (= CTL), `targetRampPct: 2` (default sweetspot +1 s.d. +3).
   - Ekstrak: `totalWeeklyBudget`, dan hitung manual alokasi per tipe sesi menggunakan CTL Multiplier.

4. **`get_wellness_data`** (Triangulasi):
   - Ambil `restingHR`, `hrv`, `sleepScore`, `weight`.

---

## 7. Format Respons Wajib — Training Load & Budget Report

```markdown
### Status Beban Latihan & Kesiapan Terkini

**Tanggal**: [Tanggal]

| Metrik | Nilai | Status & Zona |
|---|---|---|
| CTL (Fitness) | [X] | [Low/Building/Good/High] |
| ATL (Fatigue) | [X] | [Low/Moderate/High] |
| TSB (Form)    | [X] | [Zone: Transition/Fresh/Grey/Optimal/High Risk] |
| ACWR (Workload Ratio) | [X.XX] | **[Under-training/Sweet Spot/Warning/Danger]** |
| Ramp Rate     | [X] TSS/minggu | [Minimal/Sweetspot/High Build/High Risk/Taper] |
| eFTP          | [X] W | [vs. FTP baseline] |

**Evaluasi Fisiologis**: [Catatan dari advice analyze_training_load]

### Alokasi Beban Sesi Berbasis CTL Multiplier

**CTL Saat Ini**: [X] load/hari

| Tipe Sesi | Range % CTL | Target Beban (load) | Batasan Utama |
|---|---|---|---|
| **Easy / Recovery Run** | 70–90% CTL | [0.7×CTL] – [0.9×CTL] | Durasi ≤ 60 mnt, intensitas ≤ 80% CP |
| **Moderate Aerobic Run** | 100–150% CTL | [1.0×CTL] – [1.5×CTL] | Aerobic steady, mid-week |
| **Interval / Tempo Session** | 125–175% CTL | [1.25×CTL] – [1.75×CTL] | Include W/U & C/D |
| **Long Run** | 150–300% CTL | [1.5×CTL] – [3.0×CTL] | HM target: ~150–200% CTL |

### Safeguard Sesi Tunggal (30-Day Max Check)
- **30-Day Max TSS**: [X] load
- **Sesi Terberat Direncanakan Minggu Ini**: [Nama sesi] → [Y] load
- **Rasio vs 30-Day Max**: [Y/X × 100%] → [🟢 Lower / 🟡 Modest / 🟠 Moderate / 🔴 High Risk]

**Rekomendasi Eksekusi**:
- [Apakah beban aman untuk lanjut build / perlu adjustment]
- [Status Ramp Rate: apakah sweetspot atau perlu throttle]
```

---

## 8. Panduan Deload (Jika Diperlukan)

Jika ACWR > 1.5 atau TSB < threshold kritis:
1. Potong beban ke **W4 Deload level (-10% dari Baseline W1)** — bukan cut -25%.
2. Pertahankan frekuensi lari (jangan stop total).
3. Ganti sesi Quality ke Easy Aerobic + Strides.
4. Evaluasi ulang setelah 5–7 hari recovery.