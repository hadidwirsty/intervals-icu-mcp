---
description: Kalkulator estimasi waktu finish race (5K, 10K, Half Marathon, Full Marathon) dan generator jadwal tapering 2-3 minggu berbasis VDOT, CTL, & TSB via MCP predict_race_time & calculate_taper_plan.
---

# Predict Race & Tapering Plan Workflow

Workflow ini digunakan untuk menghitung estimasi waktu finish race, target pace rata-rata, dan menyusun rencana tapering penurunan volume mingguan.

---

## 1. Input Kebutuhan

Mintalah informasi berikut dari atlet (jika belum tersedia):
- **Jarak Race**: `5k`, `10k`, `half_marathon` (21.1 km), `full_marathon` (42.2 km), atau jarak kustom (km).
- **Nilai VDOT**: Hasil tes VDOT atau estimasi dari kalkulator `/calc-vdot`.
- **Target Tanggal Race**: Tanggal pelaksanaan Race A (format YYYY-MM-DD).

---

## 2. Langkah Pengambilan Data via MCP

1. Panggil MCP Tool `calculate_vdot` atau `get_fitness_chart` untuk mendapatkan data kebugaran terkini:
   - `ctl` (Kebugaran Kronis 42 hari)
   - `tsb` (Form / Kesiapan Akut)

2. Panggil MCP Tool **`predict_race_time`**:
   - Argument: `{ vdot, targetDistanceKm, ctl, tsb }`
   - Dapatkan: `predictedTimeFormatted`, `predictedPaceFormatted`, `ctlAdjustmentFactor`, `tsbAdjustmentFactor`.

3. Panggil MCP Tool **`calculate_taper_plan`**:
   - Argument: `{ raceDate, currentCtl, currentTsb, taperWeeks: 2 }`
   - Dapatkan: `weeklySchedule` (Target volume %, target TSB, dan panduan taktis eksekusi).

---

## 3. Format Respons Laporan Prediksi & Tapering

```markdown
### 🏆 Race Prediction & Tapering Plan Report

**Target Race**: [Jarak Race] km | **VDOT Active**: [VDOT]

#### 1. Prediksi Performa & Target Pace
- **Estimasi Waktu Finish**: [predictedTimeFormatted]
- **Target Pace Rata-rata**: [predictedPaceFormatted]
- **Faktor Koreksi Kebugaran (CTL)**: [ctlAdjustmentFactor] (CTL: [ctl])
- **Faktor Koreksi Kesiapan (TSB)**: [tsbAdjustmentFactor] (TSB: [tsb])

#### 2. Jadwal Tapering & Peak Freshness Plan
| Minggu Taper | Volume Target (%) | Target Tsb | Panduan Eksekusi |
|---|---|---|---|
| Minggu 1 | [volumePct]% | [targetTsb] | [guidance] |
| Minggu 2 | [volumePct]% | [targetTsb] | [guidance] |

#### 3. Rekomendasi Strategi Pacing
- **Konsistensi Half 1 vs Half 2**: Pertahankan even-pacing / slight negative split.
- **Nutrition & Hydration**: Simulasi konsumsi karbohidrat (30-60g/jam) pada sesi Long Run terakhir.
```
