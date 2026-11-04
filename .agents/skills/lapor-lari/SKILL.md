---
name: lapor-lari
description: Laporan evaluasi pasca-sesi lari komprehensif — analisis telemetri daya (% CP), kepatuhan ambang Sub-Threshold Copeland, stabilitas jantung (Aerobic Decoupling & Cardiac Drift), dan pemulihan via data Intervals.icu.
---

# /lapor-lari — Laporan Pasca-Sesi Lari Komprehensif

Skill ini digunakan **15–30 menit setelah atlet menyelesaikan sesi lari** untuk membedah telemetri latihan secara menyeluruh. Menggabungkan evaluasi kontrol daya lari (*running power*), kepatuhan zona ambang laktat, efisiensi jantung paruh 1 vs paruh 2 (*Aerobic Decoupling*), serta evaluasi kualitatif atlet.

---

## 1. Alur Kerja Otomasi Data (MCP Tools)

Saat perintah `/lapor-lari` dijalankan:

1. **Ambil Data Aktivitas Terakhir**:
   - Panggil `get_activities` untuk tanggal hari ini atau rentang 2 hari terakhir dari Intervals.icu.
   - Panggil `garmin_search_activities` dengan `activityType: "running"` dan `limit: 1` untuk mendapatkan `activityId` aktivitas lari riil di Garmin Connect.
2. **Ambil Detail Telemetri & Beban Sesi**:
   - Panggil `get_activity_details` dengan `activityId` yang didapat.
   - Ekstrak: durasi bergerak (*moving time*), jarak aktual (km), rerata kecepatan/pace, daya rata-rata (*icu_average_watts*), daya tertimbang (*icu_weighted_avg_watts*), rerata HR, Max HR, kadensi langkah, TSS/Load (*icu_training_load*), dan gear/sepatu yang dipakai.
3. **Analisis Dekomposisi Repetisi (Jika Sesi Kualitas / Sub-T)**:
   - Panggil `get_activity_intervals` untuk melihat rincian tiap repetisi kerja dan jeda istirahat (*rest jog*).
   - Verifikasi apakah repetisi kerja berada dalam koridor daya **85–95% CP** dan apakah jeda istirahat jalan santai dipatuhi: **Card A (3–4m): 30–60s**, **Card B (5–7m): 60–90s**, **Card C (10–12m): 90–120s**.
4. **Analisis Efisiensi Aerobik & Cardiac Drift (Dual-Engine Decoupling Cross-Validation)**:
   - Panggil MCP tool `analyze_cardiac_drift` dari Intervals.icu dengan `activityId`.
   - Panggil `garmin_get_activity_details` dari Garmin Connect MCP dengan parameter `includeDecoupling: true`. Garmin MCP v0.2.0 secara native menghitung *stream-based Aerobic Decoupling* ($Pw:HR$ atau $Pace:HR$), mengevaluasi tingkat keandalan (*reliability assessment*), dan secara cerdas membersihkan jeda/pause rekaman (*recording gaps*).
   - Lakukan validasi silang antara kedua engine:
     - `< 3.5%`: **Sangat Stabil (Mesin Aerobik Matang)**.
     - `3.5% – 5.0%`: **Optimal / Lolos Standar Emas**.
     - `> 5.0%`: **Terjadi Drift Signifikan** (dehidrasi, glikogen menipis, atau melampaui ambang AeT).
5. **Analisis Lanjutan & Pemulihan Dual-Engine (`garmin-connect` MCP v0.2.0)**:
   - **Sub-Integer VO2 Max (FIT message 140)**: Panggil `garmin_get_activity_streams` untuk aktivitas terkait guna mengekstrak nilai estimasi VO2 Max presisi tinggi dengan 2 desimal (misal `39.42 ml/kg/min`) untuk memantau adaptasi kebugaran mikro.
   - **Komparasi Head-to-Head (`garmin_compare_activities`)**: Jika sesi ini merupakan pengulangan dari sesi sebelumnya (misal Sub-Threshold mingguan atau rute lari rutin), panggil tool ini untuk membandingkan delta pace, delta detak jantung, delta kadens, dan perubahan *Efficiency Factor* ($EF = \text{Speed}/\text{HR}$).
   - **Audit Rekor Terbaik (`garmin_get_personal_records`)**: Manfaatkan paginasi v0.2.0 (`limit: 50`, `start: 0`, dan periksa flag `truncated`) untuk memeriksa apakah sesi hari ini memecahkan Best Effort baru (1K, 1 Mile, 5K, 10K, HM, FM, atau Longest Run).
   - **Bedah Jendela Waktu Khusus (`garmin_analyze_activity_window`)**: Jika sesi lari melibatkan blok repetisi Sub-Threshold panjang (misal Card C 10–12 menit) atau ingin mengevaluasi *pacing execution* segmen tertentu (misal segmen 5K kedua dalam 10K / Long Run), panggil tool ini dengan `startOffsetSeconds` dan `durationSeconds`. Dapatkan distribusi waktu zona HR terbobot (profil `RUNNING`), unrecorded pause seconds, serta segmentasi internal (3 sub-segmen) untuk mendeteksi *pace fading* atau lonjakan drift HR di dalam blok kerja.
   - **Audit Rehidrasi Pasca-Lari (`garmin_get_hydration_range`)**: Panggil data hidrasi hari ini untuk memeriksa asupan cairan aktual vs target harian pasca-latihan guna mencegah defisit cairan berkepanjangan.

---

## 2. Parameter Fisiologis & Matriks Evaluasi Beban (% CP)

Gunakan batas nilai persentase daya resmi berikut saat menganalisis kepatuhan atlet (ekstrak CP aktif via `get_athlete_profile` atau `icu_ftp`):

| Jenis Sesi Lari | Plafon Daya (% CP) | Formula Daya (Watt) | Plafon HR | Target RPE |
| :--- | :---: | :---: | :---: | :---: |
| **Easy / Recovery Run** | $\le 77\% - 80\%$ CP | $\le 0.77 - 0.80 \times \text{CP}$ | $\le \text{HR}_{\max} - 50\text{ bpm}$ | RPE 2 – 3 |
| **Long Aerobic Run** | $\le 75\%$ CP | $\le 0.75 \times \text{CP}$ | $\le \text{AeT} - 5\text{ bpm}$ (Sub-AeT) | RPE 3 |
| **Sub-Threshold (Copeland)** | $85\% - 95\%$ CP | $0.85 - 0.95 \times \text{CP}$ | $< \text{AnT} - 10\text{ bpm}$ | RPE 5 – 6 |
| **Batas Terlarang (VO2max)** | $> 104\%$ CP | $> 1.04 \times \text{CP}$ | $> \text{AnT}$ (Ambang Laktat) | RPE 8+ *(Dilarang!)* |

---

## 3. Koreksi Stres Termal Iklim Tropis (*Tropical Climate Fallback*)

Suhu udara $28\text{--}34^\circ\text{C}$ dan kelembapan tinggi ($>80\%$) di Yogyakarta memicu sirkulasi darah ke kulit untuk pendinginan (*thermal strain*), yang secara alami menaikkan detak jantung 10–20 bpm tanpa adanya penumpukan asam laktat berlebih:
- Jika HR melonjak namun **daya mekanik (Watt) tetap stabil di zona target dan RPE tetap santai (5–6 untuk Sub-T, 2–3 untuk Easy)**: nyatakan sesi **LULUS dan TERKONTROL BAIK**.
- Jangan memvonis atlet gagal hanya karena drift detak jantung akibat cuaca panas (*no IHSG mindset*).

---

## 4. Format Laporan Output (/lapor-lari)

Sajikan hasil analisis pasca-lari dalam Bahasa Indonesia dengan format berikut:

```markdown
# 🏃 Laporan Evaluasi Sesi Lari Atlet
**Nama Aktivitas**: [Nama Aktivitas di Intervals.icu]
**Hari/Tanggal**: [Nama Hari, DD Bulan YYYY] | **ID Sesi**: [Activity ID]
**Alas Kaki**: [Daily Cushion / Fast Trainer / Super Shoe / Recovery]

---

### 1. Ringkasan Eksekusi Sesi
| Metrik Utama | Hasil Aktual | Target Rencana | Evaluasi Kepatuhan |
| :--- | :---: | :---: | :--- |
| **Waktu Bergerak** | [XX mnt XX dtk] | [Target Durasi] | [Sesuai Rencana / Toleransi] |
| **Jarak Tempuh** | [X.XX km] | — | — |
| **Rerata Pace** | [X:XX /km] | [Rentang Target] | [Tepat Sasaran / Terlalu Cepat] |
| **Rerata Daya (Watts)** | [XXX W] ([XX.X]% CP) | [Target Watts] | [🟢 Presisi / 🟡 Terlalu Tinggi] |
| **Daya Tertimbang (NP)** | [XXX W] | — | Indeks variabilitas daya |
| **Rerata Detak Jantung** | [XXX bpm] | [Plafon HR] | [Aman di Bawah Ambang / Drift] |
| **Max Detak Jantung** | [XXX bpm] | < AnT | [0 detik di zona anaerobik] |
| **Beban Sesi (TSS/Load)** | [XX Load] | [Plafon TSS] | [Sesuai Kategori Palladino] |
| **VO2 Max Sub-Integer** | **[XX.XX] ml/kg/min** | FIT Msg 140 | [Presisi desimal Garmin Connect] |

---

### 2. Analisis Efisiensi Aerobik & Cardiac Drift (Dual-Engine Cross-Validation)
- **Aerobic Decoupling (Intervals.icu)**: **[+/-X.XX]%** ($EF_1$: [X.XXX] vs $EF_2$: [X.XXX])
- **Aerobic Decoupling (Garmin Native Stream)**: **[+/-X.XX]%** (Keandalan: [HIGH / MEDIUM / LOW] | Jeda Rekaman Ditangani)
- **Status Mesin Aerobik**: [🟢 Lolos Standar Emas (< 5%) / 🟡 Drift Ringan (5–7%) / 🔴 Drift Berat (> 7%)]
- **Komentar Biologis**: [Analisis apakah mesin stabil atau mengalami dehidrasi/glikogen menipis].

---

### 3. Komparasi Head-to-Head & Rekor (Garmin Connect)
*(Opsional: Jika dibandingkan dengan sesi sebelumnya via `garmin_compare_activities`)*
- **Sesi Pembanding**: [Nama & Tanggal Sesi Sebelumnya]
- **Delta Rerata Pace**: [+/-X detik/km]
- **Delta Rerata HR**: [+/-X bpm] (Efisiensi kardiovaskular: [Meningkat/Menurun])
- **Delta Efficiency Factor**: [+/-X.XXX] Speed/HR
- **Status Rekor Baru (Best Efforts)**: [🏆 Terdeteksi PR Baru: [Jarak] [Waktu] / ➖ Bebas Rekor Baru]

---

### 4. Evaluasi Khusus Repetisi (Jika Sesi Kualitas / Sub-Threshold)
| Repetisi | Durasi Kerja | Rerata Daya | Rerata HR | Pace | Evaluasi Copeland |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Rep 1** | [X mnt] | [XXX W] | [XXX bpm] | [X:XX /km] | [Presisi di Koridor % CP] |
| **Rep 2** | [X mnt] | [XXX W] | [XXX bpm] | [X:XX /km] | [Presisi di Koridor % CP] |
| ... | ... | ... | ... | ... | ... |
*Kepatuhan Jeda Istirahat*: [Rata-rata rest XX detik — patuh target Copeland (Card A: 30–60s, Card B: 60–90s, Card C: 90–120s jalan santai)].

*(Opsional: Bedah Jendela Waktu Kerja via `garmin_analyze_activity_window`)*:
- **Jendela Analisis**: Menit ke-[XX] s.d. [XX] (Durasi: [X] mnt)
- **Metrik Jendela**: Jarak [X.XX] km | Pace [X:XX /km] | HR [XXX] bpm (Max: [XXX]) | Kadens [XXX] SPM
- **Distribusi Zona HR (Profil `RUNNING`)**: Z1: [X]s, Z2: [X]s, Z3: [X]s, Z4: [X]s, Z5: [X]s (Unrecorded: [X]s)
- **Tren Sub-Segmen**: Segmen 1 [X:XX /km] → Segmen 2 [X:XX /km] → Segmen 3 [X:XX /km] ([Pacing Stabil / Fading / Negative Split])

---

### 5. Umpan Balik Pelatih & Arahan Pemulihan
- **Penilaian Kualitas**: [Sangat Baik / Terkontrol / Perlu Penyesuaian]
- **Status Beban Akut**: Menambah ATL sebesar +[XX] poin.
- **Rekomendasi Pemulihan**:
  - Nutrisi: Segera konsumsi karbohidrat + protein dalam 30–45 menit.
  - Rehidrasi Garmin: Asupan hari ini [XXX] ml / Target [XXX] ml ([XX]%) — Gantikan cairan tubuh (~500–750 ml air + elektrolit).
  - Agenda Besok: [Hari Istirahat / Easy Run Santai / Sesi Kekuatan McGill Big 3].
```
