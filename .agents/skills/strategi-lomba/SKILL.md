---
name: strategi-lomba
description: Perencanaan strategis lomba komprehensif — hierarki prioritas A/B/C Race Faris Salman, jadwal tapering (A/B/C Taper), split pacing berbasis Critical Power (% CP), dan protokol nutrisi gel/hidrasi tropis.
---

# /strategi-lomba — Strategi Perlombaan, Tapering, & Nutrisi Energi

Skill ini digunakan saat atlet **mempersiapkan diri menghadapi ajang perlombaan (1–4 minggu menjelang hari H) hingga pagi hari perlombaan**. Menghubungkan manajemen kelelahan A/B/C Race Coach Faris Salman dengan prediksi waktu tempuh, jadwal penurunan volume (*tapering*), strategi *pacing* berbasis daya, dan protokol nutrisi gel energi.

---

## 1. Alur Kerja Perencanaan Lomba (MCP Tools)

Saat perintah `/strategi-lomba` dijalankan (dengan input jarak lomba, tanggal, dan target, misal: `/strategi-lomba 10k 2026-11-15 A-Race`):

### Tahap 1: Klasifikasi Prioritas Lomba (Faris Salman A/B/C Race)
Tentukan status lomba ke dalam hierarki:
- **A-Race (Sasaran Puncak Musim)**: Usaha maksimal mutlak (*all-out*), target PB, frekuensi 1–2 kali per tahun. Membutuhkan **Full Taper (10–14 hari)**. RPE finish: **9–10 / 10**.
- **B-Race (Tune-Up / Uji Kebugaran)**: Evaluasi kebugaran riil (tes VDOT / CP) di tengah blok latihan. Membutuhkan **Mini Taper (4–6 hari)** dengan jeda minimal 4 hari dari sesi Sub-Threshold terakhir. RPE finish: **8–9 / 10**.
- **C-Race (Gladi Resik / Latihan Berbayar)**: Simulasi logistik, latihan *fueling* (gel/hidrasi) di kerumunan, dan pace terkontrol. **Tanpa Taper (*No Taper*)**, hanya menukar satu sesi workout mingguan menjadi Easy. RPE finish: **6–7 / 10**.

> [!WARNING]
> **Peringatan Keras Joe Friel: *"Letting Ego Disrupt Periodization"***
> Dilarang mendaftar dengan niat C-Race lalu terpancing ego menjadi *all-out* seperti A-Race di tengah lintasan. Hal ini memicu kerusakan otot tak terencana dan merusak seluruh siklus periodisasi tahunan!

### Tahap 2: Prediksi Waktu Tempuh & Penyesuaian Beban
- Panggil MCP tool `predict_race_time` dengan jarak lomba, VDOT aktif atlet (dapat dihitung via `calculate_vdot`), dan CTL saat ini.
- Terapkan penalti iklim tropis/panas ($+3\text{ s/d }+5\%$ waktu tempuh untuk suhu $> 28^\circ\text{C}$).

### Tahap 3: Penyusunan Jadwal Tapering (*A/B/C Taper Plan*)
- Panggil MCP tool `calculate_taper_plan` dengan tanggal lomba dan durasi taper terpilih:
  - **Full Taper (A-Taper 10–14 Hari)**: Volume mingguan turun 20–40%, namun **frekuensi hari lari tetap dipertahankan** agar sistem neuromuskular tetap terstimulasi. Potong durasi repetisi kerja menjadi setengahnya (misal Sub-T $6 \times 6'$ menjadi $6 \times 3'$, *strides* $10\times$ menjadi $5\times$).
  - **Mini Taper (B-Taper 4–6 Hari)**: Hilangkan interval VO2max keras dan kurangi volume 15%.

### Tahap 4: Strategi Pacing Berbasis Critical Power (% CP)
Bagi lintasan ke dalam 3 pita strategi daya:
1. **Fase Awal (KM 1 – 3) — Konservatif**: Daya **$85\% - 88\%$ CP**. Mencegah lonjakan asam laktat akibat euforia start.
2. **Fase Jelajah (KM 4 – 8) — Ambang Stabil**: Daya **$88\% - 92\%$ CP**. Menjaga efisiensi ritme dan pernapasan ritmis.
3. **Fase Akhir (KM 9 – 10) — Negative Split Finish Kick**: Daya **$93\% - 98\%$ CP**. Menghabiskan sisa glikogen menuju garis finish.

### Tahap 5: Protokol Nutrisi Gel Energi & Hidrasi Tropis
- Panggil MCP tool `calculate_race_fueling`:
  - **Produk Gel Energi**: Pilihan atlet (contoh: 30g karbohidrat per sachet, rasio Maltodekstrin : Dextrose/Fruktosa ramah lambung).
  - **Jadwal Asupan**:
    - *Gel 1*: Menit ke-0 (15 menit sebelum start bersama 150 ml air).
    - *Gel 2* (Untuk lari $> 45$ menit): Menit ke-40–45 di *water station*.
  - **Hidrasi Tropis**: 100–150 ml air dingin/isotonic setiap 2–2.5 km (hindari overhidrasi/hiponatremia).

---

## 2. Format Output Strategi (/strategi-lomba)

Sajikan strategi perlombaan dalam Bahasa Indonesia dengan format berikut:

```markdown
# 🏁 Rencana Strategis & Eksekusi Perlombaan
**Nama Perlombaan**: [Nama Lomba & Jarak] | **Tanggal Hari H**: [DD Bulan YYYY]
**Klasifikasi Lomba**: [🥇 A-Race (Target Puncak) / 🥈 B-Race (Tune-Up) / 🥉 C-Race (Gladi Resik)]
**Target Sasaran**: [Target Waktu Tempuh & Pace] | **Sepatu**: [Pilihan Sepatu Lomba Atlet]

---

### 1. Prediksi Waktu Tempuh & Sasaran Realistis
- **Prediksi Waktu Bersih**: **[JJ:MM:DD]** (Pace rata-rata: **[X:XX /km]**)
- **Target RPE Saat Finish**: **[RPE 9–10 (All-out) / RPE 8–9 / RPE 6–7 (Training)]**
- **Penyesuaian Cuaca Tropis**: [Estimasi penalti suhu & kelembapan]

---

### 2. Protokol Tapering Menjelang Lomba
- **Jenis Taper**: [A-Taper 10–14 Hari / B-Taper 4–6 Hari / C-Taper No Taper]
- **Jadwal 7 Hari Terakhir (Race Week)**:
  - *H-6*: Easy Run Santai [XX mnt]
  - *H-4*: Sesi Sentuhan Sub-T Ringan ($4 \times 3\text{ mnt}$ @ 85–90% CP)
  - *H-2*: Istirahat Total / Mobilitas McGill Big 3
  - *H-1*: Shakeout Run 15–20 mnt + 4x Strides Pendek

---

### 3. Matriks Pacing Berbasis Daya
| Segmen Lomba | Target Pace | Target Daya (% CP) | Instruksi Taktis & Mental |
| :--- | :---: | :---: | :--- |
| **KM 1 – 3** | [X:XX – X:XX /km] | **[0.85–0.88 * CP] W** (85–88%) | Tahan ego di tengah kerumunan start. |
| **KM 4 – 8** | [X:XX – X:XX /km] | **[0.88–0.92 * CP] W** (88–92%) | Ritme jelajah stabil, jaga postur tegak. |
| **KM 9 – 10**| [X:XX – X:XX /km] | **[0.93–0.98 * CP] W** (93–98%) | Buka langkah progresif, maksimalkan efisiensi energi. |

---

### 4. Jadwal Nutrisi Gel Energi & Hidrasi
- **H-2 Jam Pra-Start**: Sarapan karbohidrat mudah cerna (roti tawar/pisang) + 400 ml air.
- **H-15 Menit Pra-Start**: **Gel Energi Sachet 1 (30g Karbo)** + 150 ml air.
- **Menit Ke-40–45**: **Gel Energi Sachet 2 (30g Karbo)** di pos hidrasi.
- **Setiap Water Station (2–2.5 km)**: 2–3 teguk kecil air/isotonik secara teratur.
```
