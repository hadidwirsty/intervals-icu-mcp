---
description: Otomasi analisis status beban latihan harian atlet Muhammad Hadid Wiransetyo. Membaca CTL, ATL, TSB, ACWR, Ramp Rate, dan eFTP langsung dari Intervals.icu via MCP untuk menghasilkan laporan kesiapan latihan.
---

# Workflow: `/fitness-status`

Workflow ini digunakan untuk menghasilkan **Laporan Status Beban Latihan (Training Load & ACWR Report)** secara otomatis berdasarkan data fitness chart, evaluasi fisiologis MCP, dan wellness terkini.

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

### Step 2: Fetch & Calculate Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - `startDate`: 90 hari lalu dari tanggal target.
   - `endDate`: Tanggal target.
   - `cols`: `ctl,atl,tsb,rampRate,eftp`
   - Ambil time-series tren CTL/ATL/TSB.

2. **`analyze_training_load`** (Evaluasi ACWR & Fisiologi):
   - `ctl`: Nilai CTL terkini dari langkah 1.
   - `atl`: Nilai ATL terkini dari langkah 1.
   - `tsb`: Nilai TSB terkini (opsional).
   - `rampRate`: Nilai Ramp Rate terkini.
   - Dapatkan `acwr`, `acwrCategory`, `tsbZone`, `rampRateStatus`, dan `advice`.

3. **`get_wellness_data`** (Triangulasi Kondisi Aktual):
   - `startDate`: 7 hari lalu.
   - `endDate`: Tanggal target.
   - Ambil `restingHR`, `hrv`, `sleepScore`, `weight`.

---

### Step 3: Muat Skill Training Load Analysis

Terapkan aturan dari skill `.agents/skills/training-load-analysis/SKILL.md`:
- Interpretasikan nilai CTL, ATL, TSB, ACWR, Ramp Rate, dan eFTP terhadap zona target Hadid (CTL 45–65, ACWR 0.8–1.3 Sweet Spot).
- Triangulasi dengan data wellness (RHR, HRV, tidur) untuk validasi kondisi aktual.
- Identifikasi Fatigue Flags dan rekomendasikan deload jika ACWR > 1.5 (Danger Zone) atau TSB < -30.

---

### Step 4: Generate Training Load Report

Hasilkan laporan sesuai **Format Respons Wajib** di `training-load-analysis/SKILL.md` Section 5:
- Tabel status metrik terkini (CTL, ATL, TSB, ACWR, ACWR Category, Ramp Rate, eFTP).
- Evaluasi Fisiologis dari MCP `analyze_training_load` (`advice`).
- Tren 4 minggu terakhir.
- Rekomendasi loading untuk minggu berjalan berdasarkan siklus Coach Faris Salman (3 build : 1 deload).
- Peringatan deload jika Fatigue Flags atau Danger Zone terdeteksi.
