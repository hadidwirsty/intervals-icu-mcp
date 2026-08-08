---
description: Otomasi analisis status beban latihan atlet. Membaca CTL, ATL, TSB, Ramp Rate, dan eFTP langsung dari Intervals.icu via MCP untuk menghasilkan laporan kesiapan latihan.
---

# Workflow: `/fitness-status`

Workflow ini digunakan untuk menghasilkan **Laporan Status Beban Latihan (Training Load Report)** secara otomatis berdasarkan data fitness chart dan wellness terkini.

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

### Step 3: Muat Skill Training Load Analysis

Terapkan aturan dari skill `.agents/skills/training-load-analysis/SKILL.md`:
- Interpretasikan nilai CTL, ATL, TSB, Ramp Rate, dan eFTP.
- Bandingkan dengan zona target yang dikonfigurasi di SKILL.md.
- Identifikasi Fatigue Flags dari kombinasi data wellness dan TSB.

---

### Step 4: Generate Training Load Report

Hasilkan laporan sesuai **Format Respons Wajib** di `training-load-analysis/SKILL.md` Section 5:
- Tabel status metrik terkini (CTL, ATL, TSB, Ramp Rate, eFTP).
- Evaluasi Fisiologis dari MCP `analyze_training_load` (`advice`).
- Tren 4 minggu terakhir.
- Rekomendasi loading untuk minggu berjalan.
- Peringatan deload jika Fatigue Flags terdeteksi.
