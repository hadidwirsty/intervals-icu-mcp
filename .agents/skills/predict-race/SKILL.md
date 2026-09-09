---
name: predict-race
description: Kalkulator estimasi waktu finish race (5K, 10K, Half Marathon, Full Marathon) dan generator jadwal tapering 2-3 minggu berbasis VDOT, CTL, & TSB via MCP predict_race_time & calculate_taper_plan.
---

# Skill: `/predict-race`

Skill ini digunakan untuk menghitung estimasi waktu finish race, target pace rata-rata, dan menyusun rencana tapering penurunan volume mingguan.

---

## 1. Input Kebutuhan

Mintalah informasi berikut dari atlet (jika belum tersedia):
- **Jarak Race**: `5k`, `10k`, `half_marathon` (21.1 km), `full_marathon` (42.2 km), atau jarak kustom (km).
- **Nilai VDOT**: Hasil tes VDOT atau estimasi dari kalkulator `/calc-vdot`.
- **Target Tanggal Race**: Tanggal pelaksanaan Race A (format YYYY-MM-DD).

---

## 2. Langkah Pengambilan & Kalkulasi Data via MCP

1. **Penentuan Nilai VDOT**:
   - **Opsi A (Dari Riwayat Race / Time Trial)**: Panggil MCP Tool `calculate_vdot` dengan argumen `{ raceTime: "MM:SS" / "HH:MM:SS", distanceKm: X }` (misal 10K dalam 48:30 menghasilkan VDOT ~42.3).
   - **Opsi B (Diberikan Langsung oleh Atlet)**: Gunakan angka VDOT yang diinput atlet (misal VDOT 50).
   - **Opsi C (Fallback Profil)**: Panggil `get_athlete_profile` atau `get_fitness_chart` untuk melihat metrik `eftp` / `threshold_pace` sebagai estimasi.

2. **`get_fitness_chart`**:
   - `startDate`: 42 hari lalu.
   - `endDate`: Hari ini.
   - `cols`: `ctl,atl,tsb`
   - Ambil nilai `ctl` (Kebugaran Kronis 42 hari) dan `tsb` (Form / Kesiapan Akut).

3. **`predict_race_time`**:
   - Argument: `{ vdot, targetDistanceKm, ctl, tsb }`
   - Dapatkan: `predictedTimeFormatted`, `predictedPaceFormatted`, `ctlAdjustmentFactor`, dan `tsbAdjustmentFactor`.

4. **`calculate_taper_plan`**:
   - Argument: `{ raceDate, currentCtl: ctl, currentTsb: tsb, taperWeeks: 2, racePriority: "A" | "B" | "C" }`
   - Opsi `racePriority`:
     * `"A"` (Default): Full Taper (10–14 hari / 2–3 minggu). Frekuensi lari tetap, volume dipotong ke 75% lalu 50%, repetisi interval dipotong ~50%, target RPE finish 9–10/10.
     * `"B"`: Mini Taper (4–6 hari). Volume ~85%, eliminasi severe stressor (VO₂max), aturan jeda minimal 4 hari dari sesi Subthreshold, target RPE finish 8–9/10 (CP Test / tune-up).
     * `"C"`: No Taper (0 hari). Volume 100%, protokol tukar 1 hari hard workout menjadi Easy Run, target RPE finish 6–7/10, doktrin Joe Friel (anti-upgrade all-out).
   - Dapatkan: `racePriority`, `taperTypeDescription`, `targetFinishRpe`, `weeklySchedule`, `subthresholdGapRule`, dan `egoManagementRule`.

---

## 3. Format Respons Laporan Prediksi & Tapering

```markdown
### 🏆 Race Prediction & Tapering Plan Report

**Target Race**: [Jarak Race] km | **Kategori Prioritas**: Race [A/B/C] ([taperTypeDescription])
**VDOT Active**: [VDOT] | **Target RPE Pas Finish**: [targetFinishRpe]

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

#### 3. Aturan Taktis & Eksekusi Khusus
- [Jika Race B] **Aturan Emas Subthreshold**: [subthresholdGapRule]
- [Jika Race C] **Joe Friel Ego Management Rule**: [egoManagementRule]
- **Konsistensi Pacing**: Pertahankan even-pacing / slight negative split.
- **Nutrition & Hydration**: Simulasi konsumsi karbohidrat (30-60g/jam) pada sesi Long Run terakhir / gladiresik.
```
