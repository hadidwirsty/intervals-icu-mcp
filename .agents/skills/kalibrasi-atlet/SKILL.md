---
name: kalibrasi-atlet
description: Pusat kalibrasi berkala kebugaran atlet (tiap 4–8 minggu) — kalkulator Jack Daniels VDOT, matriks interval Sub-Threshold Copeland, pemetaan zona detak jantung Hadd, diagnosa defisiensi aerobik (ADS), dan audit zona detak jantung Garmin Connect.
---

# /kalibrasi-atlet — Pusat Kalibrasi Kebugaran & Diagnosa Aerobik

Skill ini digunakan **secara berkala (setiap 4–8 minggu) setelah atlet menyelesaikan tes lapangan, time trial, atau perlombaan resmi**. Berfungsi untuk memperbarui angka VDOT, mengalibrasi target pace/power repetisi Copeland, memetakan zona detak jantung absolut John Hadd, mendiagnosis integritas mesin aerobik (Uphill Athlete 10% Rule & Horwill's Rule), serta mengaudit sinkronisasi zona detak jantung resmi di perangkat Garmin via **`garmin-connect` MCP**.

---

## 1. Alur Kerja Kalibrasi Data (MCP Tools)

Saat perintah `/kalibrasi-atlet` dijalankan (dengan input hasil tes, misal: `/kalibrasi-atlet 5k 24:30` atau membaca data dari profil/lomba):

### 1. Hitung VDOT & Zona Lari Jack Daniels (Intervals.icu Engine):
- Panggil MCP tool `calculate_vdot` dengan jarak tes (meter) dan durasi (detik).
- Dapatkan skor VDOT terkini (atau ekstrak dari profil/riwayat aktivitas atlet).
- Panggil `calculate_pace_zones` untuk menghasilkan rentang kecepatan resmi (*Easy, Marathon, Threshold, Interval, Repetition*).

### 2. Hitung Matriks Interval Norwegian Singles Copeland:
- Panggil `calculate_nsa_matrix` dengan nilai VDOT terbaru.
- Hasilkan target pace dan watt untuk durasi repetisi Copeland:
  - **Fast (3–4 menit / Card A)**: $5\text{--}10\text{ detik/km lebih lambat}$ dari Threshold VDOT. Jeda istirahat: **30–60 detik** jalan santai.
  - **Medium (4–6 menit / Card B)**: $10\text{--}15\text{ detik/km lebih lambat}$ dari Threshold VDOT. Jeda istirahat: **60–90 detik** jalan santai.
  - **Long (10–12 menit / Card C)**: $15\text{--}25\text{ detik/km lebih lambat}$ dari Threshold VDOT. Jeda istirahat: **90–120 detik** jalan santai.

### 3. Diagnosa Mesin Aerobik & Spektrum ADS (Uphill Athlete & Horwill):
- Panggil `diagnose_aerobic_base` dengan parameter:
  - `ant`: Ambang Anaerobik / LTHR atlet (diekstrak via `get_training_zones` atau `get_athlete_profile`).
  - `aet`: Ambang Aerobik Dasar (dapat diperkirakan $\approx \text{HR}_{\max} - 50\text{ bpm}$ atau dari tes bicara / laktat).
  - `raceSplits`: Waktu tempuh 5K vs 10K aktual atlet (misal: 5K vs 10K resmi).
- Klasifikasikan ke dalam 4 Derajat Keparahan ADS:
  - **Tingkat 1: Optimal ($\le 10\%$)** $\rightarrow$ Bebas volume Sub-T penuh (20–25% jam mingguan).
  - **Tingkat 2: Mild Lag ($10.1\% - 13\%$)** $\rightarrow$ Sub-T dibatasi repetisi pendek (Card A 3m), perbanyak Easy run.
  - **Tingkat 3: Moderate ADS ($13.1\% - 18\%$)** $\rightarrow$ Tangguhkan tempo panjang & Card B/C, 85–90% Easy.
  - **Tingkat 4: Severe ADS ($> 18\%$)** $\rightarrow$ Fase *Pure Base Building*: 12–16 minggu prioritas lari santai sub-AeT.

### 4. Hitung Zona Detak Jantung Absolut John Hadd:
- Panggil `calculate_hadd_zones` dengan `maxHr` aktual atlet:
  - **Easy Running**: $\le \text{HR}_{\max} - 50\text{ bpm}$.
  - **Start Sub-Threshold**: $\approx \text{HR}_{\max} - 35\text{ bpm}$.
  - **Marathon Race HR**: $\approx \text{HR}_{\max} - 25\text{ s/d }30\text{ bpm}$.
  - Terapkan *The 16 km No-Drift Rule*: Boleh naik target HR $+5\text{ bpm}$ HANYA jika tuntas 16 km stabil tanpa *cardiac drift*.

### 5. Audit Sinkronisasi Perangkat Keras Garmin (`garmin-connect` MCP):
- Panggil MCP tool `garmin_get_heart_rate_zones` untuk memastikan pengaturan zona lari di jam tangan atlet telah tersinkronisasi:
  - Konfirmasi metode: `LACTATE_THRESHOLD` (sesuai LTHR dan Max HR terkalibrasi).
  - Pastikan Zone 2 Floor Garmin dan Zone 3 Floor tidak memicu bias lari terlalu kencang di hari santai.

---

## 2. Format Output Kalibrasi (/kalibrasi-atlet)

Sajikan hasil kalibrasi kebugaran dalam Bahasa Indonesia dengan format berikut:

```markdown
# 🔬 Laporan Kalibrasi Kebugaran & Diagnosa Aerobik (Dual-Engine)
**Tanggal Kalibrasi**: [DD Bulan YYYY]
**Dasar Kalibrasi**: [Hasil Tes / Lomba / Baseline Terverifikasi]
**Parameter Atlet**: Max HR [XXX] bpm | LTHR/AnT [XXX] bpm | Critical Power [XXX] W | Berat [XX] kg

---

### 1. Skor VDOT & Parameter Ambang Laktat (Jack Daniels)
- **Skor VDOT Terkalibrasi**: **[XX.X]**
- **Threshold Pace VDOT**: **[X:XX /km]** (Ambang batas LT2 teoritis)
- **Rentang Kecepatan Easy Run**: **[X:XX – X:XX /km]**

---

### 2. Matriks Interval Norwegian Singles Copeland (Pace & Daya)
*Formula Copeland: Repetisi sub-maksimal disetel 5–25 detik LEBIH LAMBAT dari Threshold VDOT.*

| Format Repetisi | Durasi Kerja | Target Pace | Target Daya (% CP) | RPE Target | Recovery Jog |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Fast (Card A)** | 3 – 4 menit | [X:XX – X:XX /km] | **[0.90–0.95 * CP] W** (90–95%) | RPE 6–7 | 30–60 detik jalan |
| **Medium (Card B)**| 4 – 6 menit | [X:XX – X:XX /km] | **[0.87–0.92 * CP] W** (87–92%) | RPE 5–6 | 60–90 detik jalan |
| **Long (Card C)**  | 10 – 12 menit| [X:XX – X:XX /km] | **[0.85–0.90 * CP] W** (85–90%) | RPE 5 | 90–120 detik jalan |
*Catatan Penting*: Sensasi latihan harus terasa *"kegampangan"* dan terkontrol, bukan sampai mual/muntah.

---

### 3. Diagnosa Defisiensi Aerobik (Spektrum ADS)
- **Ambang Anaerobik (AnT / LTHR)**: **[XXX] bpm**
- **Ambang Aerobik Dasar (AeT / VT1)**: **[XXX] bpm**
- **Celah Aerobik (Aerobic Gap)**:
  $$\frac{\text{AnT} - \text{AeT}}{\text{AnT}} \times 100\% = \mathbf{[XX.X]\%}$$
- **Status Spektrum**: **[Tingkat 1 Optimal / Tingkat 2 Mild Lag / Tingkat 3 Moderate / Tingkat 4 Severe ADS]**
- **Verifikasi Horwill's Rule**: Perlambatan 5K ke 10K adalah **+[XX] s/km** (Standar ideal mesin matang: $\le +10\text{ s/km}$).

---

### 4. Zona Detak Jantung Absolut John Hadd
- **Easy Aerobic Floor ($\le \text{HR}_{\max} - 50$)**: **$\le [\text{HR}_{\max} - 50]\text{ bpm}$**
- **Threshold Floor ($\approx \text{HR}_{\max} - 35$)**: **$\approx [\text{HR}_{\max} - 35]\text{ bpm}$**
- **Marathon Race HR ($\approx \text{HR}_{\max} - 25\text{--}30$)**: **$\approx [\text{HR}_{\max} - 30] - [\text{HR}_{\max} - 25]\text{ bpm}$**
- **Aturan Progresi**: Tahan intensitas tetap stabil selama 4–6 minggu sebelum menaikkan target detak jantung berikutnya.

---

### 5. Audit Sinkronisasi Zona Garmin Connect
- **Status Konfigurasi Lari**: `LACTATE_THRESHOLD` (Tersinkronisasi)
- **LTHR Aktif Garmin**: **[XXX] bpm** | **Max HR Aktif**: **[XXX] bpm** | **Resting HR**: **[XX] bpm**
- **Plafon Z2 Garmin (Aerobic)**: [XXX–XXX] bpm *(Catatan: Untuk lari santai murni, prioritaskan zona sub-aerobik Hadd)*.
```
