---
name: training-load-analysis
description: Skill interpretasi beban latihan berbasis sains (CTL, ATL, TSB, Ramp Rate, eFTP) dari Intervals.icu. Menghubungkan data fitness chart dengan konteks periodisasi dan kondisi kesiapan atlet untuk menghasilkan analisis training load yang akurat.
---

# Training Load Analysis Skill

Skill ini digunakan untuk menganalisis kondisi beban latihan harian atlet berdasarkan data fitness chart (CTL/ATL/TSB) dari **Intervals.icu MCP**.

---

## 1. Definisi Metrik Utama

### Chronic Training Load (CTL) — "Fitness"
- **Definisi**: Rata-rata beban latihan 42 hari terakhir (eksponensial moving average). Representasi kebugaran kardiovaskular jangka panjang.
- **Interpretasi Umum**:
  - **CTL < 40**: Base building — fondasi aerobik sedang dibangun.
  - **CTL 40–60**: Aerobic development fase aktif — zona produktif untuk sebagian besar pelari.
  - **CTL 60–80**: High fitness — monitoring ekstra diperlukan.
  - **CTL > 80**: Elite zone — biasanya dicapai pelari semi-profesional atau profesional.

> [!IMPORTANT]
> **Sesuaikan rentang CTL ini dengan program dan level atlet Anda.** Target CTL berbeda antara pelari pemula, recreational, dan competitive.

### Acute Training Load (ATL) — "Fatigue"
- **Definisi**: Rata-rata beban latihan 7 hari terakhir. Representasi akumulasi kelelahan jangka pendek.
- **ATL > CTL + 20**: Kelelahan akut berlebih — risiko overtraining atau cedera.
- **ATL < CTL - 10**: Deload / undertraining — tubuh sangat pulih, siap menerima load lebih tinggi.

### Training Stress Balance (TSB) — "Form / Freshness"
- **Formula**: `TSB = CTL - ATL`
- **Interpretasi**:
  - `TSB > +10`: Sangat segar — ideal untuk race/testing.
  - `TSB 0 – +10`: Segar & siap — ideal untuk workout intensitas tinggi.
  - `TSB -10 – 0`: Tired & functional — zona latihan produktif, adaptasi terjadi.
  - `TSB -10 – -25`: Sangat lelah — pertimbangkan deload atau recovery week.
  - `TSB < -25`: Overstressed — wajib deload/istirahat segera.

### Ramp Rate (RR)
- **Definisi**: Kenaikan CTL per minggu.
- **Zona Aman**: ≤ +5–7 CTL/minggu (di luar fase kompetitif).
- **Warning**: Ramp Rate > +8 CTL/minggu meningkatkan risiko cedera signifikan.

### eFTP (Estimated FTP)
- **Definisi**: Estimasi FTP terkini berdasarkan data kinerja aktual dari aktivitas terbaru.
- Gunakan sebagai validasi terhadap nilai `icu_ftp` yang tersimpan di profil.

---

## 2. Konteks Program Latihan Atlet

> [!IMPORTANT]
> **Sesuaikan bagian ini dengan program latihan dan fase periodisasi Anda.** Tentukan target CTL, TSB alert threshold, dan loading model (misal: 3:1, 4:1, atau 2:1 build:recovery ratio).

- **Fase Aktif**: `[Nama Fase, contoh: Base Building / Aerobic Development / Race Prep]`
- **Target CTL Ideal**: `[X – Y]` (zona produktif untuk program Anda)
- **Loading Model**: `[Contoh: 3 minggu build → 1 minggu deload]`
- **Fatigue Flags**:
  - TSB < `[X]` selama `[N]` hari berturut-turut → rekomendasikan deload.
  - Ramp Rate > `[X]`/minggu → perlambat loading.

---

## 3. Workflow Pengambilan Data dari MCP

1. **`get_fitness_chart`**:
   - Parameter: `startDate` (90 hari lalu), `endDate` (hari ini).
   - `cols`: `ctl,atl,tsb,rampRate,eftp`
   - Dapatkan time-series tren CTL/ATL/TSB dalam 90 hari terakhir.

2. **`get_wellness_data`** (Triangulasi):
   - Parameter: `startDate` (7 hari lalu), `endDate` (hari ini).
   - Ambil `restingHR`, `hrv`, `sleepScore` untuk validasi kondisi aktual.

---

## 4. Format Respons Wajib — Training Load Report

```markdown
### Status Beban Latihan Terkini

**Tanggal**: [Tanggal]

| Metrik | Nilai | Status |
|---|---|---|
| CTL (Fitness) | [X] | [Low/Building/Good/High] |
| ATL (Fatigue) | [X] | [Low/Moderate/High] |
| TSB (Form)    | [X] | [Fresh/Functional/Tired/Overstressed] |
| Ramp Rate     | [X]/minggu | [Safe/Caution/Warning] |
| eFTP          | [X] W | [vs. FTP baseline] |

**Tren 4 Minggu**: [Naik/Stabil/Turun] — [Deskripsi singkat tren CTL]

**Rekomendasi Loading Minggu Ini**:
- [Apakah perlu tambah volume / pertahankan / kurangi]
- [Apakah ada risiko fatigue flags]
- [Target TSB ideal untuk workout besok]
```

---

## 5. Panduan Deload (Jika Diperlukan)

Jika TSB < threshold kritis atau Ramp Rate berlebih:
1. Kurangi intensitas sesi workout → ganti ke easy aerobic.
2. Pertahankan frekuensi lari (jangan stop total).
3. Evaluasi ulang setelah 5–7 hari recovery.
