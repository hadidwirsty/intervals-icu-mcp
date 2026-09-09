---
name: readiness-check
description: Evaluasi kesiapan fisik & skor pemulihan harian atlet (0-100% GREEN, YELLOW, RED) berbasis TSB, ACWR, Sleep Score, & RHR Spike via MCP calculate_readiness_score.
---

# Skill: `/readiness-check`

Skill ini digunakan untuk mengevaluasi skor kesiapan harian atlet sebelum memulai sesi latihan untuk mencegah *overtraining* dan risiko cedera.

---

## 1. Langkah Pengambilan Data via MCP

1. **`get_fitness_chart`**:
   - `startDate`: 42 hari lalu.
   - `endDate`: Hari ini (`YYYY-MM-DD`).
   - `cols`: `ctl,atl,tsb,rampRate`
   - Ambil nilai `ctl` (Fitness), `atl` (Fatigue), dan `tsb` (Form) terkini.

2. **`analyze_training_load`**:
   - Input: `{ ctl, atl, tsb }` dari langkah 1.
   - Dapatkan: `acwr` (Acute:Chronic Workload Ratio), `tsbZone`, dan evaluasi risiko beban.

3. **`get_wellness_data`**:
   - Parameter: `startDate` dan `endDate` pada hari ini.
   - Ambil data harian: `sleepScore`, `restingHR`, dan `hrv`.

4. **`calculate_readiness_score`**:
   - Pass: `{ tsb, acwr, sleepScore, restingHr }`
   - Dapatkan: `readinessScore`, `status`, `tsbContribution`, `acwrContribution`, `wellnessContribution`, dan `recommendation`.

---

## 2. Format Respons Laporan Readiness Check

```markdown
### 🟢 Daily Recovery & Readiness Report

**Unified Readiness Score**: **[readinessScore] / 100** | **Status**: **[status]**

#### 1. Rincian Kontribusi Skor
- **Kesiapan Akut (TSB)**: +[tsbContribution] poin (TSB: [tsb])
- **Rasio Beban (ACWR)**: +[acwrContribution] poin (ACWR: [acwr])
- **Wellness & Tidur**: +[wellnessContribution] poin (Sleep Score: [sleepScore])

#### 2. Rekomendasi Sesi Hari Ini
- **Status**: **[status]**
- **Panduan**: [recommendation]
  * If `GREEN (>=80%)`: Kondisi fisik optimal. Siap eksekusi sesi intensitas tinggi / interval / tempo.
  * If `YELLOW (50-79%)`: Kondisi sedang. Batasi intensitas ke Zona 2 Aerobic / Easy Run.
  * If `RED (<50%)`: Kelelahan / stress tinggi. Disarankan deload, easy walk, atau istirahat total.

#### 3. 🚨 Evaluasi 4 Red Flags Kelelahan (Coach Faris Salman)
Verifikasi apakah ada $\ge 2$ hal dari kriteria berikut muncul:
1. [ ] **RHR Pagi naik > 5 bpm** dari baseline (Aktual: [RHR] bpm vs Baseline: 46 bpm).
2. [ ] **Kualitas tidur buruk 2 malam berturut-turut** (Sleep score rendah).
3. [ ] **Motivasi lari drop drastis** (kelelahan sistem saraf pusat / CNS fatigue).
4. [ ] **Easy pace terasa berat** pada sesi terakhir meski intensitas dijaga.

> ⚠️ **Aturan Emas**: Jika $\ge 2$ sinyal Red Flag aktif, jangan paksakan jadwal Quality! Turunkan sesi hari ini ke **Easy Recovery** atau **Rest Total**, dan pertimbangkan aktivasi **Deload / Maintenance Week**.
```
