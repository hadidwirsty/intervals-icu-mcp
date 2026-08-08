---
description: Kalkulator budget latihan mingguan atlet Muhammad Hadid Wiransetyo. Menghitung total budget mingguan, batas maksimum Long Run (30-35%), Quality Run (15-20%), dan Easy Run (45-55%) menggunakan MCP tool calculate_weekly_budget.
---

# Workflow: `/weekly-budget`

Workflow ini digunakan untuk menghitung **Budget & Proporsi Latihan Mingguan (Weekly Training Budget Report)** secara otomatis berdasarkan data 42-day average daily load (CTL) dari Intervals.icu via MCP tool `calculate_weekly_budget`.

---

## Format Prompt Penggunaan

**Budget mingguan standar (+5% ramp rate):**
```text
/weekly-budget
```

**Budget mingguan dengan target ramp rate kustom (misal +3% atau 0% maintenance):**
```text
/weekly-budget 3
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
- Ekstrak `targetRampPct`: Persentase kenaikan mingguan (default 5 jika diabaikan).

---

### Step 2: Fetch & Calculate Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - `startDate`: 42 hari lalu.
   - `endDate`: Hari ini.
   - `cols`: `ctl,atl,tsb`
   - Ambil nilai CTL (Chronic Training Load / 42d average daily load) terbaru.

2. **`calculate_weekly_budget`**:
   - `avgDailyLoad`: Nilai CTL dari langkah 1.
   - `targetRampPct`: Nilai dari Step 1 (default: 5).
   - Dapatkan `totalWeeklyBudget`, `longRunMin`–`longRunMax`, `qualityIntervalMin`–`qualityIntervalMax`, `easyRunMin`–`easyRunMax`, dan `guidelines`.

3. **`get_athlete_profile`**:
   - Ambil `ftp` (CP 305W baseline) dan `lthr` untuk referensi intensitas sesi.

---

### Step 3: Muat Skill Training Load Analysis

Terapkan aturan proporsi dari skill `.agents/skills/training-load-analysis/SKILL.md`:
- Long Run Cap: 30–35% dari Total Budget.
- Quality Interval Cap: 15–20% dari Total Budget (Workout Selasa & Kamis Coach Faris Salman).
- Easy & Recovery Run Allocation: 45–55% dari Total Budget (Rabu, Jumat, Minggu).

---

### Step 4: Generate Weekly Budget Report

Hasilkan laporan evaluasi budget dengan format berikut:

```markdown
### Budget & Proporsi Latihan Minggu Ini (Target +[X]% Ramp)

**Baseline CTL (42d Avg)**: [CTL] Load/Hari
**Base Weekly Load**: [CTL × 7] Load

| Komponen Beban | Persentase | Budget Load (Min – Max) | Panduan Alokasi Sesi |
|---|---|---|---|
| **Total Weekly Budget** | **100%** | **[Total Budget] Load** | Total akumulasi beban 6 sesi lari |
| **Long Run Slot (Sabtu)** | 30 – 35% | [Long Run Min] – [Long Run Max] Load | Sesi Long Run HMP Tempo / Fartlek |
| **Quality Intervals (Sel/Kam)** | 15 – 20% | [Quality Min] – [Quality Max] Load | Total gabungan Workout 1 & Workout 2 |
| **Easy & Recovery (Rab/Jum/Ming)** | 45 – 55% | [Easy Min] – [Easy Max] Load | EZ Aerobic 35-40m + Strides |

**Panduan Eksekusi Coach Faris Salman**:
- **Long Run Cap**: Maksimal [Long Run Max] Load agar tidak menguras energi aerobik mingguan.
- **Quality Interval Cap**: Maksimal [Quality Max] Load gabungan untuk Selasa & Kamis.
- **Easy Run Allocation**: Alokasikan [Easy Min]–[Easy Max] Load untuk memastikan pemulihan kardiovaskular berjalan optimal.
```
