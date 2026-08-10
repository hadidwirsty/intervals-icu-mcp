---
description: Kalkulator alokasi 4 minggu mesosiklus dengan rasio 3:1 (Build-Deload). Merencanakan alokasi TSS/Jarak untuk Build Week 1-3 dan Planned Deload Week 4 (-25%).
---

# Workflow: `/mesocycle-block`

Workflow ini digunakan untuk merencanakan alokasi beban (*load/TSS*) atau jarak (*distance/km*) selama **1 Blok Mesosiklus (4 Minggu Berturut-turut)** menggunakan prinsip **3:1 Build-to-Deload Ratio** dari Coach Faris Salman.

---

## Format Prompt Penggunaan

**Budget Berbasis Load (TSS / Time):**
```text
/mesocycle-block load
```

**Budget Berbasis Jarak (Kilometer / Distance):**
```text
/mesocycle-block distance
```

---

## Langkah Eksekusi Sistem

### Step 1: Ambil Data Baseline dari MCP Intervals.icu
1. **`get_fitness_chart`** (7 hari terakhir):
   - Ambil nilai CTL harian terkini (misal: `ctl = 50`).
2. Panggil MCP tool **`calculate_weekly_budget`**:
   - Jika `mode = "distance"`: panggil dengan `mode: "distance"`, `avgDailyLoad: [ctl_atau_avg_daily_km]`.
   - Jika `mode = "load"`: panggil dengan `mode: "load"`, `avgDailyLoad: [ctl]`.

---

### Step 2: Kalkulasi Formula Rasio 3:1 (Build:Deload Ratio)

Hitung alokasi 4 minggu secara terstruktur:

- **Week 1 (Base Build)**: Baseline + 5% (`Budget Base`)
- **Week 2 (Progressive Build)**: Week 1 + 5% (`Budget Base × 1.05`)
- **Week 3 (Peak Build)**: Week 2 + 5% (`Budget Base × 1.10`)
- **Week 4 (Planned Deload)**: Week 3 **- 25%** (`Peak Budget × 0.75`) — *Recovery & Supercompensation Trigger*.

---

### Step 3: Distribution Breakdown per Tipe Lari

Untuk Setiap Minggu (W1 – W4), bagi total budget sesuai alokasi presisi Coach Faris:
- **Long Run Slot**: **30 – 35%** dari total budget minggu tersebut.
- **Quality Workouts Slot**: **15 – 20%** dari total budget minggu tersebut.
- **Easy Running Slot**: **45 – 55%** dari total budget minggu tersebut.

---

### Step 4: Generate Mesocycle Block Report

```markdown
### 📊 Matriks Perencanaan Mesosiklus 4 Minggu (3:1 Build:Deload)

**Mode Budget**: [Load (TSS) / Distance (km)]
**Baseline (CTL / 42d Avg)**: [Value] [TSS/km]

| Minggu | Fase Siklus | Total Budget | Long Run (30-35%) | Quality Workouts (15-20%) | Easy Runs (45-55%) | Catatan & Fokus |
|---|---|---|---|---|---|---|
| **Week 1** | Base Build | [W1 Budget] | [W1 LR] | [W1 Quality] | [W1 Easy] | Pengenalan ritme blok |
| **Week 2** | Progressive Build | [W2 Budget] | [W2 LR] | [W2 Quality] | [W2 Easy] | Kenaikan durasi interval |
| **Week 3** | Peak Build Block | [W3 Budget] | [W3 LR] | [W3 Quality] | [W3 Easy] | Beban puncak & test |
| **Week 4** | **Planned Deload** | **[W4 Budget]** | **[W4 LR]** | **[W4 Quality]** | **[W4 Easy]** | **Potong volume -25% (Supercompensation)** |

---

💡 **Instruksi Coach untuk Deload Week (Week 4)**:
- Jaga durasi Easy Run di 30–35 menit.
- Ganti sesi Subthreshold keras dengan EZ Aerobic + 4x Strides.
- Jangan menambah jarak ekstra meski merasa sangat fresh (ego management!).
```
