---
description: Otomasi analisis status beban latihan atlet. Membaca CTL, ATL, TSB, Ramp Rate, eFTP, dan deteksi otomatis Deload Week via MCP. Menggunakan CTL Multiplier System (Palladino Power Project) dan Blok Mesosiklus 5 Minggu (Coach Faris Salman).
---

# Workflow: `/fitness-status`

Workflow ini digunakan untuk menghasilkan **Laporan Status Beban Latihan (Training Load Report)** secara otomatis berdasarkan data fitness chart, wellness terkini, dan **Deteksi Otomatis Deload Week Warning** berbasis Blok Mesosiklus 5 Minggu Coach Faris Salman.

---

## Format Prompt Penggunaan

```text
/fitness-status
```

Atau dengan tanggal spesifik:

```text
/fitness-status 2026-08-08
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
- Jika ada argumen tanggal → gunakan sebagai `endDate`.
- Jika kosong → gunakan hari ini.
- `startDate` selalu 90 hari sebelum `endDate`.

---

### Step 2: Fetch Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - `startDate`: 90 hari lalu dari tanggal target.
   - `endDate`: Tanggal target.
   - `cols`: `ctl,atl,tsb,rampRate,eftp`
   - Ambil time-series tren CTL/ATL/TSB dan **30-day Max TSS** (untuk Single Run Safeguard).

2. **`analyze_training_load`** (Evaluasi ACWR & Fisiologi):
   - `ctl`: Nilai CTL terkini.
   - `atl`: Nilai ATL terkini.
   - `tsb`: Nilai TSB terkini.
   - `rampRate`: Nilai Ramp Rate terkini.
   - Dapatkan `acwr`, `acwrCategory`, `tsbZone`, `rampRateStatus`, dan `advice`.

3. **`get_wellness_data`** (Triangulasi Kondisi Aktual):
   - `startDate`: 7 hari lalu.
   - `endDate`: Tanggal target.
   - Ambil `restingHR`, `hrv`, `sleepScore`, `weight`.

---

### Step 3: Automated Deload Week & Fatigue Flag Detection

Sistem secara otomatis mengevaluasi kriteria **Deload Week Protocol** sesuai Blok 5 Minggu Coach Salman:

1. **TSB Status**: Jika `tsb < -30` (High Risk Fatigue Accumulation — sesuai definisi TSB Zone di `training-load-analysis/SKILL.md`).
2. **ACWR Status**: Jika `acwr > 1.35` (Warning / Danger Zone).
3. **Wellness Flag**: Jika RHR Pagi naik > 5 bpm dari baseline ATAU Sleep Score drop 2 malam berturut-turut.
4. **Siklus Mesosiklus 5 Minggu**: Jika minggu berjalan adalah **minggu ke-4 dari blok 5 mingguan** (W4 = Deload terjadwal).
5. **Ramp Rate Flag**: Jika `rampRate > +5 TSS/minggu` (di luar Sweetspot Palladino yang merekomendasikan `+1 s.d. +3`).

Jika minimal **2 Kriteria Terpenuhi** → AKTIFKAN **Deload Week Warning**:
> *"⚠️ DELOAD WEEK WARNING: Akumulasi kelelahan tinggi terdeteksi (TSB [X], ACWR [X], Ramp Rate [X]). Eksekusi W4 Deload — potong beban ke 90% dari Baseline W1 (bukan -25%!). Ganti sesi Quality ke Easy Aerobic ≤ 60 menit + Strides."*

> [!IMPORTANT]
> **Kedalaman Deload**: -10% dari Baseline (W1), **bukan** -25% dari Peak (W3). Ini sesuai standar Coach Faris Salman untuk menjaga neuromuscular tone tetap aktif selama recovery week.

---

### Step 4: Kalkulasi CTL Multiplier & Single Run Safeguard

Setelah mendapatkan CTL terkini, hitung target beban per tipe sesi:

| Tipe Sesi | Target Beban | Batas |
|---|---|---|
| Easy / Recovery Run | `0.70×CTL – 0.90×CTL` | Cap ≤ 60 menit, ≤ 80% CP |
| Moderate Aerobic Run | `1.00×CTL – 1.50×CTL` | Mid-week, masih aerobik |
| Interval / Tempo Session | `1.25×CTL – 1.75×CTL` | Include W/U & C/D |
| Long Run (HM Prep) | `1.50×CTL – 2.00×CTL` | Sesuaikan fase periodisasi |

**Single Run Safeguard** (Frandsen et al. 2025):
- Hitung `30-Day Max TSS` dari historical `get_fitness_chart`.
- Bandingkan dengan target Long Run atau sesi terberat minggu ini:
  - `< 105%` → 🟢 Lower Risk
  - `105–109%` → 🟡 Modest Risk
  - `110–114%` → 🟠 Moderate Risk
  - `≥ 115%` → 🔴 High Risk — wajib kurangi beban

---

### Step 5: Generate Training Load Report

Hasilkan laporan sesuai **Format Respons Wajib** di `training-load-analysis/SKILL.md` Section 7:

```markdown
### 📊 Status Beban Latihan & Kesiapan — [Tanggal]

| Metrik | Nilai | Status & Zona |
|---|---|---|
| CTL (Fitness) | [X] | [Low/Building/Good/High] |
| ATL (Fatigue) | [X] | [Low/Moderate/High] |
| TSB (Form)    | [X] | [Transition/Fresh/Grey/Optimal/High Risk] |
| ACWR          | [X.XX] | [Under-training/Sweet Spot/Warning/Danger] |
| Ramp Rate     | [X] TSS/minggu | [Minimal/Sweetspot ✅/High Build/High Risk ⚠️] |
| eFTP          | [X] W | [vs. FTP baseline] |

**Evaluasi Fisiologis**: [Catatan dari advice analyze_training_load]

### 🎯 Target Beban Sesi Minggu Ini (CTL: [X] load/hari)

| Tipe Sesi | Target Beban (load) | Keterangan |
|---|---|---|
| Easy / Recovery Run | [0.7×CTL] – [0.9×CTL] | ≤ 60 menit, ≤ 80% CP |
| Moderate Aerobic Run | [1.0×CTL] – [1.5×CTL] | Mid-week steady |
| Interval / Tempo | [1.25×CTL] – [1.75×CTL] | Inc. W/U & C/D |
| Long Run | [1.5×CTL] – [2.0×CTL] | HM Prep |

### 🛡️ Single Run Safeguard
- **30-Day Max TSS**: [X] load
- **Rencana Sesi Terberat**: [Nama] → [Y] load → [Y/X × 100%] — [Status Risiko]

### ⚠️ Deload Week Detection
- **Status**: [AKTIF / Non-Aktif]
- **Kriteria Terpenuhi**: [List kriteria yang terpenuhi]
- **Tindakan**: [Rekomendasi deload jika aktif]

### 📈 Tren 4 Minggu Terakhir
[Narasi tren CTL/ATL/TSB, apakah dalam blok Build atau Deload, posisi dalam Blok 5 Minggu]

### Rekomendasi Loading Minggu Ini
- [Apakah aman lanjut build / perlu W4 Deload / atau maintenance]
- [Target Ramp Rate: sweetspot +1 s.d. +3 TSS/minggu]
```