---
name: cek-kesiapan
description: Evaluasi kesiapan fisik harian, skor pemulihan terpadu (0–100% HIJAU/KUNING/MERAH) via Dual-Engine (Garmin Connect Body Battery & HRV Status + Intervals.icu CTL/ATL/TSB), dan deteksi 5 Red Flags kelelahan Faris Salman & Garmin.
---

# /cek-kesiapan — Evaluasi Kesiapan Harian & Dasbor Kebugaran (Dual-Engine)

Skill ini bertindak sebagai **pemeriksaan denyut harian (*Daily Health & Readiness Pulse*)** sebelum atlet melangkah ke luar pintu untuk memulai sesi latihan hari ini. Menggabungkan telemetri biometrik asli dari **Garmin Connect** (Body Battery, Native HRV Status, Sleep Stages, Daily Stress) dan analitik beban latihan jangka panjang dari **Intervals.icu** (CTL, ATL, TSB, Ramp Rate, ACWR).

---

## 1. Alur Kerja Otomasi Data Dual-Engine (MCP Tools)

Saat perintah `/cek-kesiapan` dijalankan, lakukan pemanggilan data secara terstruktur dari kedua penyedia data:

### Langkah A: Ambil Biometrik Pemulihan Asli (Garmin Connect MCP)
1. Panggil MCP tool `garmin_get_daily_wellness_snapshot` untuk tanggal hari ini (`today`) atau tanggal kalender terbaru:
   - **Body Battery™**: Level saat bangun/terkini (*latest*), pengisian semalam (*charged*), pengurasan (*drained*), tertinggi (*highest*), dan terendah (*lowest*).
   - **Native HRV Status**: Status resmi Garmin (`BALANCED`, `UNBALANCED`, `LOW`), rerata semalam (*nightlyAverage*), rerata mingguan (*weeklyAverage*), serta garis dasar (*baseline low–high*).
   - **Daily Stress**: Rata-rata tingkat stres harian (*dailyAverage*) dan puncak stres (*maxStressLevel*).
   - **Aktivitas Fisik**: Total langkah kemarin (*steps*), kalori aktif, dan Resting HR sensorik hari ini.
2. Panggil MCP tool `garmin_get_daily_heart_rate_intraday` untuk tanggal hari ini:
   - Ambil nilai `restingHeartRate` hari ini dan `lastSevenDaysAvgRestingHeartRate` (rata-rata 7 hari yang dihitung langsung oleh Garmin).
3. *(Opsional jika butuh detail tidur mendalam)*: Panggil `garmin_get_sleep_details` untuk melihat proporsi tidur nyenyak (*deep sleep*), REM, dan kualitas restorasi gelombang lambat.

### Langkah B: Ambil Data Kebugaran & Beban Latihan (Intervals.icu MCP)
1. Panggil `get_fitness_chart` untuk membaca posisi kebugaran:
   - **CTL (Fitness)**: Akumulasi kebugaran kronis 42 hari.
   - **ATL (Fatigue)**: Beban kelelahan akut 7 hari.
   - **TSB (Form)**: Keseimbangan bentuk tubuh ($\text{CTL} - \text{ATL}$).
   - **CTL Ramp Rate**: Kenaikan kebugaran mingguan.
2. Panggil `analyze_training_load`:
   - Dapatkan rasio **ACWR** ($\text{ATL} / \text{CTL}$), status zona TSB, dan evaluasi keamanan Ramp Rate Steve Palladino ($+1\text{ s/d }+3\text{ TSS/minggu}$).
3. Panggil `get_wellness_data` (rentang 28 hari terakhir, atau 365 hari untuk audit tahunan) dan proses dengan MCP tool `calculate_rhr_baseline`:
   - **Baseline Range Dinamis RHR**: Mirip mekanisme *Overnight HRV Baseline* Garmin, hitung rentang normal `[low, high]` bpm berbasis rata-rata bergerak 28 hari (4 minggu) $\pm$ deviasi standar normal.
   - Ekstrak rata-rata 7 Hari (`avg7d`), 4 Minggu (`avg28d`), dan 1 Tahun (`avg1y`).
   - Tentukan status RHR hari ini: `BALANCED` (dalam rentang normal), `ELEVATED` (sedikit di atas batas atas), `SPIKE_RED_FLAG` (melonjak $> 5\text{ bpm}$ di atas rata-rata baseline), atau `SUPPRESSED` (anjlok tidak wajar).

### Langkah C: Hitung Skor Kesiapan Komposit Terpadu (Dual-Engine Readiness)
Panggil MCP tool `calculate_readiness_score` dengan parameter terpadu:
- `tsb`: nilai TSB hari ini.
- `acwr`: rasio ATL / CTL.
- `sleepScore`: skor kualitas tidur dari Garmin / Intervals.icu (skala 0–100).
- `bodyBattery`: level Garmin Body Battery bangun tidur / terkini (0–100).
- `hrvStatus`: status resmi HRV semalam (`BALANCED`, `UNBALANCED`, atau `LOW`).
- `restingHr`: Resting HR sensor Garmin hari ini.
- `rhrBaseline`: objek rentang baseline dinamis RHR `{ low, high, avg7d, avg28d, avg1y }`. *(Jangan lagi gunakan angka statis hardcoded!)*

*Integrasi Native Dual-Engine*:
- Engine otomatis menghitung rata-rata terbobot antara TSB, ACWR, Sleep Score, dan Body Battery, serta mengevaluasi penalti HRV (`UNBALANCED` / `LOW`) dan RHR terhadap baseline range dinamis.
- Jika terdeteksi lonjakan RHR parah (`SPIKE_RED_FLAG` / $> 5\text{ bpm}$ di atas rata-rata baseline) atau Body Battery $< 30$, sistem secara otomatis mencegah rekomendasi status **HIJAU** untuk melindungi keselamatan fisiologis atlet.

---

## 2. Aturan Pengawalan: 5 Red Flags Kelelahan Terpadu

Evaluasi secara ketat apakah terdapat **$\ge 2$ sinyal bahaya** dari daftar berikut:
1. 🚨 **RHR Pagi melonjak $> 5\text{ bpm}$** di atas rata-rata baseline dinamis (7-hari / 4-minggu) atau status RHR menunjukkan `SPIKE_RED_FLAG`.
2. 🚨 **Kualitas tidur buruk 2 malam berturut-turut** (Sleep Score $< 70\%$ atau durasi $< 6\text{ jam}$). *(Gunakan `garmin_get_sleep_summaries_range` jika butuh konfirmasi tren 7 hari)*.
3. 🚨 **Motivasi latihan anjlok drastis / kelesuan mental** (tanda kelelahan sistem saraf pusat / CNS).
4. 🚨 **Easy pace terasa berat pada usaha napas normal** (dilaporkan atlet pada catatan lari kemarin).
5. 🚨 **Garmin Biometric Red Flag**: Body Battery bangun tidur $< 40$, atau pengisian semalam (*charged*) $< 30\text{ poin}$, atau status HRV Garmin `UNBALANCED`/`LOW` selama 2 malam berturut-turut. *(Gunakan `garmin_get_stress_range` atau `garmin_get_hrv_range` untuk verifikasi stres fisiologis kronis)*.

> [!CAUTION]
> **Tindakan Otomatis Jika $\ge 2$ Red Flags Aktif**:
> Seluruh rencana sesi kualitas (*Sub-Threshold / Strides*) hari ini **WAJIB DIBATALKAN**. Atlet diarahkan beralih ke **Deload Adaptif** (istirahat total atau *Easy Recovery Run* sangat ringan 30 menit pada RPE 2 / $\le 65\%$ CP).

---

## 3. Protokol Khusus Perlindungan Tulang Belakang & Punggung Bawah (*Spinal Protection Protocol*)

Jika atlet melaporkan rasa tegang (*tightness*) atau pegal pada punggung bawah (*Lower Back Pain / LBP*):
- Aktifkan **Flag Proteksi Punggung Bawah**.
- Larang lari dengan impak tinggi. Alihkan volume ke *Cross-Training* non-impak (sepeda statis pada $\le 70–75\%$ FTP Sepeda atau renang gaya dada).
- Anjurkan protokol stabilisasi tulang belakang **McGill Big 3** (Modified Curl-Up, Side Plank, Bird Dog) dengan penahanan statis 8–10 detik.

---

## 4. Format Laporan Output (/cek-kesiapan)

Sajikan hasil analisis secara rapi dalam Bahasa Indonesia dengan format berikut:

```markdown
# 🩺 Laporan Kesiapan & Dasbor Kebugaran Atlet (Dual-Engine)
**Hari/Tanggal**: [Nama Hari, DD Bulan YYYY] | **Pukul**: [Waktu WIB]
**Atlet**: [Nama Atlet] (CP [XXX] W | RHR Baseline Range: [Low–High] bpm [4w Avg: XX bpm])

---

### 1. Skor Kesiapan Komposit (Readiness Score)
- **Status Hari Ini**: [🟢 HIJAU (Prima) / 🟡 KUNING (Waspada) / 🔴 MERAH (Pemulihan)]
- **Skor Kesiapan**: **[XX] / 100**
- **Rekomendasi Utama**: [Sesi Kualitas Sub-T Boleh Eksekusi / Easy Run Ringan Saja / Istirahat Total]

---

### 2. Telemetri Biometrik Asli (Garmin Connect)
| Parameter Garmin | Nilai Terkini | Status & Ambang | Interpretasi Fisiologis |
| :--- | :---: | :---: | :--- |
| **Body Battery™** | **[XX] / 100** | [Tinggi/Sedang/Rendah] | Charged: +[XX] | Drained: -[XX] |
| **Status HRV Semalam** | **[BALANCED / UNBALANCED]** | [XX] ms (Base: [XX–XX]) | [Keseimbangan sistem saraf otonom] |
| **Tingkat Stres Harian** | **[XX] / 100** | [Rendah / Sedang / Tinggi] | Rata-rata beban stres fisiologis Garmin |
| **Resting HR Sensor** | **[XX] bpm** | Base: [XX–XX] bpm (7d: [X], 4w: [Y], 1y: [Z]) | Status: [BALANCED / ELEVATED / RED FLAG] |
| **Aktivitas Kemarin** | **[XX.XXX] langkah** | [XXX] kkal aktif | Beban gerak non-lari |

---

### 3. Parameter Kebugaran Beban Latihan (Intervals.icu)
| Metrik Kebugaran | Nilai Terkini | Status Zona | Keterangan Fisiologis |
| :--- | :---: | :---: | :--- |
| **CTL (Fitness)** | [XX.X] | Optimal | Akumulasi beban kebugaran 42 hari terakhir. |
| **ATL (Fatigue)** | [XX.X] | Terkendali | Beban kelelahan akut 7 hari terakhir. |
| **TSB (Form)** | [+/-X.X] | [Zona] | Keseimbangan beban (Form positif = segar, negatif = produktif). |
| **ACWR** | [X.XX] | Aman (< 1.30) | Rasio beban akut terhadap kronis (sweetspot: 0.80–1.30). |
| **CTL Ramp Rate** | [+/-X.X] TSS/wk | [Status Palladino] | Rekomendasi aman: +1 s/d +3 TSS/minggu. |

---

### 4. Audit 5 Red Flags Kelelahan Terpadu
- [ ] Lonjakan RHR > 5 bpm dari baseline dinamis ([Aktif/Aman])
- [ ] Kualitas tidur buruk 2 malam berturut-turut ([Aktif/Aman])
- [ ] Kelelahan SSP / Mood drop ([Aktif/Aman])
- [ ] Sensasi Easy pace berat ([Aktif/Aman])
- [ ] Garmin Flag (Body Battery < 40 atau HRV Unbalanced) ([Aktif/Aman])
*Status Red Flags*: **[0/5 Aman / Terdeteksi X Sinyal]**

---

### 5. Panduan Aksi Hari Ini
- **Menu Terjadwal**: [Sesi hari ini di kalender Intervals.icu]
- **Keputusan Pelatih**: [Lanjutkan sesuai rencana / Modifikasi beban / Ganti ke Easy Run]
- **Saran Sepatu**: [Daily Cushion (Easy) / Max Cushion (Recovery/Proteksi) / Fast Trainer (Sub-T) / Natural Trainer (Mobilitas)]
```
