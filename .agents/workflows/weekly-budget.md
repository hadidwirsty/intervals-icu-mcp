---
description: Kalkulator budget latihan mingguan atlet (Dual-Mode: Load TSS & Distance Km). Menghitung total budget mingguan, batas maksimum Long Run (30-35%), Quality Run (15-20%), dan Easy Run (45-55%) menggunakan MCP tool calculate_weekly_budget.
---

# Workflow: `/weekly-budget`

Workflow ini digunakan untuk menghitung **Budget & Proporsi Latihan Mingguan (Weekly Training Budget Report)** secara otomatis berdasarkan data 42-day average daily load (CTL) atau jarak harian (km) dari Intervals.icu via MCP tool `calculate_weekly_budget`.

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

**Budget mingguan dengan target ramp rate kustom (misal +3% atau 0% maintenance):**
```text
/weekly-budget 3
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
- Ekstrak `mode`: `load` (default, TSS) atau `distance` (km).
- Ekstrak `targetRampPct`: Persentase kenaikan mingguan (default 5 jika diabaikan).

---

### Step 2: Fetch & Calculate Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - `startDate`: 42 hari lalu.
   - `endDate`: Hari ini.
   - `cols`: `ctl,atl,tsb`
   - Ambil nilai CTL (42d average daily load) atau rata-rata jarak harian (km).

2. **`calculate_weekly_budget`**:
   - `avgDailyLoad`: Nilai CTL atau rata-rata km harian dari langkah 1.
   - `mode`: `load` atau `distance`.
   - `targetRampPct`: Nilai dari Step 1 (default: 5).
   - Dapatkan `totalWeeklyBudget` (atau `totalWeeklyBudgetKm`), `longRunMin`–`longRunMax`, `qualityIntervalMin`–`qualityIntervalMax`, `easyRunMin`–`easyRunMax`, dan `guidelines`.

3. **`get_athlete_profile`**:
   - Ambil `ftp` dan `lthr` untuk referensi intensitas sesi.

---

### Step 3: Muat Skill Training Load Analysis

Terapkan aturan proporsi dari skill `.agents/skills/training-load-analysis/SKILL.md`:
- Long Run Cap: 30–35% dari Total Budget.
- Quality Interval Cap: 15–20% dari Total Budget.
- Easy & Recovery Run Allocation: 45–55% dari Total Budget.

---

### Step 4: Generate Weekly Budget Report

Hasilkan laporan evaluasi budget dengan format berikut:

```markdown
### Budget & Proporsi Latihan Minggu Ini (Mode: [Load TSS / Distance Km] | Target +[X]% Ramp)

**Baseline (42d Avg)**: [Value] [TSS/km]/Hari
**Base Weekly Total**: [Base Total] [TSS/km]

| Komponen Beban | Persentase | Budget (Min – Max) | Panduan Alokasi Sesi |
|---|---|---|---|
| **Total Weekly Budget** | **100%** | **[Total Budget] [TSS/km]** | Total akumulasi beban sesi lari |
| **Long Run Slot** | 30 – 35% | [Long Run Min] – [Long Run Max] [TSS/km] | Sesi Long Run HMP / Tempo / Fartlek |
| **Quality Intervals** | 15 – 20% | [Quality Min] – [Quality Max] [TSS/km] | Total gabungan sesi interval/workout |
| **Easy & Recovery** | 45 – 55% | [Easy Min] – [Easy Max] [TSS/km] | Sesi EZ Aerobic + Strides / Recovery |

**Panduan Eksekusi**:
- **Long Run Cap**: Maksimal [Long Run Max] [TSS/km] agar tidak menguras energi aerobik mingguan.
- **Quality Interval Cap**: Maksimal [Quality Max] [TSS/km] gabungan untuk sesi workout.
- **Easy Run Allocation**: Alokasikan [Easy Min]–[Easy Max] [TSS/km] untuk pemulihan optimal.
```