---
description: Evaluasi kesiapan fisik & skor pemulihan harian atlet (0-100% GREEN, YELLOW, RED) berbasis TSB, ACWR, Sleep Score, & RHR Spike via MCP calculate_readiness_score.
---

# Recovery & Readiness Check Workflow

Workflow ini digunakan untuk mengevaluasi skor kesiapan harian atlet sebelum memulai sesi latihan untuk mencegah *overtraining* dan risiko cedera.

---

## 1. Langkah Pengambilan Data via MCP

1. Panggil MCP Tool `analyze_training_load` untuk mendapatkan:
   - `tsb` (Form / Kesiapan Akut)
   - `acwr` (Acute:Chronic Workload Ratio)

2. Panggil MCP Tool `get_wellness_data` untuk tanggal hari ini untuk mendapatkan:
   - `sleepScore`
   - `restingHR`

3. Panggil MCP Tool **`calculate_readiness_score`**:
   - Pass: `{ tsb, acwr, sleepScore, restingHr }`
   - Dapatkan: `readinessScore`, `status`, `tsbContribution`, `acwrContribution`, `wellnessContribution`, `recommendation`.

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
```
