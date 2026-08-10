---
description: Otomasi analisis status beban latihan atlet. Membaca CTL, ATL, TSB, Ramp Rate, eFTP, dan deteksi otomatis Deload Week via MCP.
---

# Workflow: `/fitness-status`

Workflow ini digunakan untuk menghasilkan **Laporan Status Beban Latihan (Training Load Report)** secara otomatis berdasarkan data fitness chart, wellness terkini, dan **Deteksi Otomatis Deload Week Warning**.

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
   - Ambil time-series tren CTL/ATL/TSB.

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

Sistem secara otomatis mengevaluasi kriteria **Deload Week Protocol**:
1. **TSB Status**: Jika `tsb < -25` (High Risk Fatigue Accumulation).
2. **ACWR Status**: Jika `acwr > 1.35` (Warning / Danger Zone).
3. **Wellness Flag**: Jika RHR Pagi naik >5 bpm dari baseline ATAU Sleep Score drop 2 malam berturut-turut.
4. **Siklus 3:1 Mesocycle**: Jika minggu berjalan adalah minggu ke-4 dari blok mesosiklus 4 mingguan.

Jika minimal **2 Kriteria Terpenuhi** → AKTIFKAN **Deload Week Warning**:
> *"⚠️ DELOAD WEEK WARNING: Akumulasi kelelahan tinggi terdeteksi (TSB [X], ACWR [X]). Wajib potong volume sebesar 20-30% minggu ini dan ganti sesi Subthreshold keras dengan EZ Aerobic 35m + Strides."*

---

### Step 4: Generate Training Load Report

Hasilkan laporan sesuai **Format Respons Wajib** di `training-load-analysis/SKILL.md` Section 5:
- Tabel status metrik terkini (CTL, ATL, TSB, Ramp Rate, eFTP).
- Evaluasi Fisiologis dari MCP `analyze_training_load` (`advice`).
- **Status Deload Week Warning** (Aktif / Non-Aktif).
- Tren 4 minggu terakhir.
- Rekomendasi loading untuk minggu berjalan.
- Peringatan deload jika Fatigue Flags terdeteksi.