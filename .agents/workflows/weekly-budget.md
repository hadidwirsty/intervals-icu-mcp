---
description: Kalkulator budget latihan mingguan atlet (Dual-Mode: Load TSS & Distance Km). Menghitung total budget mingguan dan alokasi beban per tipe sesi menggunakan CTL Multiplier System (Palladino Power Project) dengan target Ramp Rate sweetspot +1 s.d. +3 TSS/minggu.
---

# Workflow: `/weekly-budget`

Workflow ini digunakan untuk menghitung **Budget & Proporsi Latihan Mingguan (Weekly Training Budget Report)** secara otomatis berdasarkan data CTL (42-day average daily load) dari Intervals.icu via MCP tool `calculate_weekly_budget`, dengan distribusi beban per sesi berbasis **CTL Multiplier System dari Palladino Power Project**.

---

## Format Prompt Penggunaan

**Budget mingguan berbasis Load (TSS - Default):**
```text
/weekly-budget
```

**Budget mingguan berbasis Jarak (Kilometer / Km):**
```text
/weekly-budget distance
```

**Budget mingguan dengan target ramp rate kustom (misal +1% maintenance atau +3% build):**
```text
/weekly-budget 3
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
- Ekstrak `mode`: `load` (default, TSS) atau `distance` (km).
- Ekstrak `targetRampPct`: Persentase kenaikan mingguan.
  - **Default: `2`** (setara kenaikan CTL ~+2 TSS/minggu, dalam sweetspot Palladino `+1 s.d. +3`).
  - Jika user menentukan angka → gunakan nilai tersebut.
  - Ingatkan user jika input `> 5` bahwa ini **High Risk** per standar Palladino.

---

### Step 2: Fetch & Calculate Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - `startDate`: 90 hari lalu (untuk hitung 30-Day Max TSS & 42d avg).
   - `endDate`: Hari ini.
   - `cols`: `ctl,atl,tsb,rampRate`
   - Ambil:
     - **CTL terkini** (= 42d average daily load, referensi semua kalkulasi multiplier).
     - **30-Day Max TSS** dari data historis (referensi Single Run Safeguard).
     - **Ramp Rate terkini** untuk evaluasi apakah sudah di sweetspot.

2. **`calculate_weekly_budget`**:
   - `avgDailyLoad`: Nilai CTL dari langkah 1.
   - `mode`: `load` atau `distance`.
   - `targetRampPct`: Nilai dari Step 1 (default: **2**).
   - Dapatkan `totalWeeklyBudget` (atau `totalWeeklyBudgetKm`) sebagai referensi total akumulasi beban.

3. **`get_athlete_profile`**:
   - Ambil `ftp` dan `lthr` untuk referensi intensitas sesi.

---

### Step 3: Kalkulasi CTL Multiplier per Tipe Sesi

Gantikan model proporsi kaku (% dari total mingguan) dengan **CTL Multiplier System**:

| Tipe Sesi | Range % CTL | Target Beban per Sesi | Batasan Kritis |
|---|---|---|---|
| **Easy / Recovery Run** | `70–90% CTL` | `0.70×CTL – 0.90×CTL` | **Cap durasi ≤ 60 menit**, intensitas ≤ 80% CP/FTP |
| **Moderate Aerobic Run** | `100–150% CTL` | `1.00×CTL – 1.50×CTL` | Mid-week, masih fully aerobic |
| **Interval / Tempo Session** *(inc. W/U & C/D)* | `125–175% CTL` | `1.25×CTL – 1.75×CTL` | Sesi kualitas (Subthreshold/VO₂max) |
| **Long Run (HM Prep)** | `150–200% CTL` | `1.50×CTL – 2.00×CTL` | Sesuaikan fase periodisasi aktif |

> [!TIP]
> **Aturan Easy Run Cap**: Ketika CTL meningkat dan beban mingguan perlu naik, **jangan perpanjang durasi Easy Run** melewati 60 menit. Alokasikan kenaikan beban ke sesi Interval, Tempo, atau Long Run.

> [!IMPORTANT]
> **Single Run Safeguard**: Sebelum menetapkan target Long Run, verifikasi rasio beban rencana vs 30-Day Max TSS:
> - `< 105%` → 🟢 Lower Risk
> - `105–109%` → 🟡 Modest Risk
> - `110–114%` → 🟠 Moderate Risk
> - `≥ 115%` → 🔴 High Risk — wajib kurangi

---

### Step 4: Generate Weekly Budget Report

Hasilkan laporan evaluasi budget dengan format berikut:

```markdown
### 📊 Budget & Alokasi Latihan Minggu Ini
**Mode**: [Load TSS / Distance Km] | **Target Ramp**: +[X]% ([Y] TSS/minggu)

**CTL Terkini (42d Avg)**: [CTL] load/hari
**Ramp Rate Aktual**: [X] TSS/minggu → [Minimal/Sweetspot ✅/High Build/High Risk ⚠️]
**Total Weekly Budget (ref)**: [Total Budget] [TSS/km]

---

### 🎯 Alokasi Beban per Tipe Sesi (CTL Multiplier)

| Tipe Sesi | Target Beban | Estimasi Durasi | Batas & Catatan |
|---|---|---|---|
| **Easy / Recovery Run** | [0.7×CTL] – [0.9×CTL] load | ≤ 60 menit | ≤ 80% CP, cap 60 mnt KETAT |
| **Moderate Aerobic Run** | [1.0×CTL] – [1.5×CTL] load | 60–80 menit | Steady aerobic, mid-week |
| **Interval / Tempo Session** | [1.25×CTL] – [1.75×CTL] load | 50–80 menit | Inc. Warmup & Cooldown |
| **Long Run (HM Prep)** | [1.5×CTL] – [2.0×CTL] load | 90–140 menit | Sesuai fase periodisasi |

---

### 🛡️ Single Run Safeguard — Long Run Check
- **30-Day Max TSS**: [X] load
- **Target Long Run Minggu Ini**: [Y] load ([Y/X × 100%])
- **Status**: [🟢 Lower / 🟡 Modest / 🟠 Moderate / 🔴 High Risk]

---

### 📋 Panduan Eksekusi Mingguan
- **Easy Run**: Target [0.8×CTL] load per sesi (midpoint). Durasi ≤ 60 menit KETAT.
  → Jika CTL naik, jangan naikkan durasi easy run — naikkan beban di Quality Days.
- **Interval/Tempo**: Target [1.5×CTL] load (midpoint). Verifikasi W/U & C/D sudah masuk hitungan.
- **Long Run**: Target [1.75×CTL] load (midpoint). Cek Single Run Safeguard sebelum eksekusi.
- **Ramp Rate Minggu Ini**: Target kenaikan CTL sebesar +[X] TSS/minggu (sweetspot: +1 s.d. +3).
```