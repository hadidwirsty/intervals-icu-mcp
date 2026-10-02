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

#### 3. 🚨 Evaluasi Sinyal Red Flag Kelelahan (Monitoring Tambahan — diperkuat norwegiansingles.run 2026)
> TSB, ACWR, dan RHR baseline berfungsi sebagai indikator objektif pelengkap anjuran kualitatif NSA ("listen to your body").
> **Prinsip Emas Resmi norwegiansingles.run 2026 (Bab 6: Adjust your week)**:  
> *"A good dashboard disagrees with how you feel: Always prioritize your body's signals over watch metrics."*  
> Jika skor readiness atau metrik jam tangan menunjukkan status GREEN (Prima), namun sensasi subjektif tubuh merasa berat, lelah, atau kaku, **selalu prioritaskan sinyal fisik tubuh** daripada angka dashboard!

Verifikasi apakah ada kriteria berikut muncul:
1. [ ] **RHR Pagi naik > 5 bpm** dari baseline normal.
2. [ ] **Kualitas tidur buruk 2 malam berturut-turut** (Sleep score rendah / durasi < 6 jam).
3. [ ] **Motivasi lari drop drastis** (kelelahan sistem saraf pusat / CNS fatigue).
4. [ ] **Easy pace terasa berat** pada sesi terakhir meski intensitas dijaga.
5. [ ] **Nyeri / Kekakuan Sendi atau Otot (Musculoskeletal Check)**: Terdeteksi rasa nyeri atau kekakuan abnormal pada otot/sendi.

> ⚠️ **Panduan Tindakan**:
> - Jika $\ge 2$ sinyal dari Flag 1–4 aktif: Turunkan sesi ke **Easy Recovery** atau **Rest Total**, dan pertimbangkan aktivasi **Deload Adaptif**.
> - **🚨 ATURAN KHUSUS FLAG 5 (PROTOKOL CEDERA & CROSS-TRAINING — Sumber: NSA §4.9)**:
>   * Jika terdeteksi nyeri atau peradangan sendi/otot, tunda sesi lari berbenturan keras.
>   * **Opsi 1 (Restorasi Penuh)**: Ubah ke Rest Total / Easy Walk dan peregangan mobilitas ringan.
>   * **Opsi 2 (Cross-Training Menjaga Volume — Sumber: NSA §4.9)**: *"Cross-Training: Can be used to supplement volume or substitute sessions during injury recovery, mimicking the E-Q-E-Q-E-Q-LR structure using modalities like cycling, elliptical, or arc trainer, focusing on similar durations and sub-threshold efforts."* Atlet diizinkan mengganti sesi lari dengan **Cross-Training (sepeda statis, elliptical, atau arc trainer)** pada intensitas dan durasi yang setara guna menjaga kebugaran aerobik tanpa beban impak mekanis pada sendi.

#### 4. 🌙 Konteks Hari Latihan & Pemulihan Khusus (Opsional)
- **Kondisi Puasa / Fasting**: Jika atlet berpuasa pada hari tertentu, sesi latihan dibatasi strictly **Easy Recovery Run santai sore hari (40–45m, HR ≤ 70%)**. Dilarang melakukan sesi kualitas dalam kondisi kekurangan cairan atau glikogen.
- **Sesi Pasca-Puasa**: Verifikasi hidrasi dan asupan karbohidrat yang cukup sebelum memulai sesi Quality berikutnya.
```