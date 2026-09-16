---
name: training-load-analysis
description: Skill interpretasi beban latihan berbasis sains (CTL, ATL, TSB, ACWR, Ramp Rate, eFTP, Weekly Budget) dari Intervals.icu. Menghubungkan data fitness chart dengan konteks metodologi Norwegian Singles Training Method untuk menghasilkan analisis training load yang akurat.
---

# Training Load Analysis Skill — Norwegian Singles Edition

Skill ini digunakan untuk menganalisis beban latihan kronis dan akut atlet berdasarkan data *fitness chart* (CTL/ATL/TSB/ACWR) dari **Intervals.icu MCP**, berlandaskan prinsip beban berkelanjutan (*sustainable load*) dan alokasi durasi resmi **Norwegian Singles Training Method** (`docs/references/norwegian-singles/`).

---

## 1. Definisi Metrik Utama & Fisiologi Beban NSA

### Chronic Training Load (CTL) — "Sustainable Fitness"
- **Definisi**: Rata-rata beban latihan tertimbang 42 hari terakhir (exponential moving average).
- **Prinsip Beban Norwegian Singles**:
  - Metode Norwegian Singles memungkinkan akumulasi CTL yang tinggi secara aman karena *sub-threshold work* memiliki repetabilitas yang sangat tinggi dibanding latihan keras di atas LT2.
  - Terdapat korelasi kuat antara **CTL berkelanjutan tertinggi** yang dapat dipertahankan atlet tanpa kelelahan kronis dengan potensi performa balap (*race performance potential*).
  - Tujuannya bukan sekadar mengejar angka CTL setinggi-tingginya secara instan, melainkan menemukan **beban berkelanjutan tertinggi dalam batas aman**.

### Acute Training Load (ATL) — "Fatigue"
- **Definisi**: Rata-rata beban latihan 7 hari terakhir, mencerminkan kelelahan jangka pendek.
- **Evaluasi**:
  - `ATL > CTL + 20`: Kelelahan akut berlebih — waspadai penurunan kualitas sesi Sub-T berikutnya.
  - `ATL < CTL - 10`: Pemulihan tinggi — tubuh siap untuk sesi kualitas penuh.

### Training Stress Balance (TSB) — "Form / Freshness"
- **Formula**: `TSB = CTL - ATL`
- **Zona Interpretasi NSA**:
  - `TSB +5 s.d. +15`: **Fresh & Race Ready** — target kondisi di hari balap atau time-trial.
  - `TSB -10 s.d. +5`: **Neutral / Transition** — fase pemulihan aktif.
  - `TSB -25 s.d. -10`: **Optimal Training Zone** — zona latihan produktif mingguan di mana adaptasi ambang laktat terjadi.
  - `TSB < -30`: **High Risk / Overstressed** — sinyal bahaya, segera jadwalkan hari pemulihan ekstra atau kurangi volume repetisi.

### Acute:Chronic Workload Ratio (ACWR) — "Injury Risk Indicator"
- **Formula**: `ACWR = ATL / CTL` (dihitung via MCP tool `analyze_training_load`).
- **Interpretasi**:
  - `< 0.8`: Under-training (penurunan stimulus aerobik).
  - **`0.8 – 1.3`**: **Sweet Spot** (zona aman & produktif — risiko cedera terendah).
  - `1.3 – 1.5`: **Warning Zone** (lonjakan beban terlalu cepat).
  - `> 1.5`: **Danger Zone** (risiko cedera muskuloskeletal meningkat tajam — wajib kurangi volume).

### Ramp Rate (RR)
- **Definisi**: Kenaikan CTL per minggu (TSS/minggu).
- **Rekomendasi NSA**:
  - **Sweetspot**: **`+1 s.d. +3 TSS/minggu`**. Progresi bertahap yang konsisten jauh lebih unggul dibanding lonjakan drastis yang memicu cedera atau jeda latihan panjang.

---

## 2. Aturan Alokasi Waktu Latihan (The 75/25 Duration Rule)

Dalam Norwegian Singles, pembagian beban **tidak menggunakan formula persentase multiplier yang rumit**, melainkan berakar pada **total durasi waktu lari mingguan**:

1. **Total Waktu Lari Mingguan**:
   - Rentang umum pelari rekreasional: **5 hingga 9 jam per minggu**.
2. **Porsi Sub-Threshold (20–25% Total Waktu)**:
   - Total durasi akumulasi sesi kerja Sub-Threshold (tidak termasuk pemanasan/pendinginan) dibatasi ketat pada **20–25% dari total waktu lari mingguan**.
   - Contoh: Pada volume 6 jam (360 menit) per minggu, durasi kerja Sub-T adalah **72–90 menit per minggu**, yang didistribusikan ke dalam 2 hingga 3 sesi kualitas (misal: 3 sesi × 25–30 menit kerja Sub-T).
3. **Porsi Easy & Recovery (75–80% Total Waktu)**:
   - Sisa waktu (75–80%) wajib diisi lari yang benar-benar lambat dan memulihkan:
     - Easy Aerobic Run: 40–50 menit (cap 60 menit ketat).
     - Long Run: 75–90 menit (cukup untuk target 5k hingga Half Marathon).
     - Seluruh lari easy wajib berada di intensitas `< 70% Max HR` atau `< 65% MAS`.

---

## 3. Menemukan "Green Zone" & Deteksi Kelelahan Adaptif

Konsep utama manajemen beban NSA adalah menjaga atlet berada di dalam **"Green Zone"** — level latihan sub-threshold mingguan yang memaksimalkan adaptasi tanpa mengorbankan pemulihan untuk sesi berikutnya.

### 4 Sinyal Red Flag Kelelahan (Pemicu Deload Adaptif)
Jika ditemukan $\ge 2$ sinyal berikut secara bersamaan, segera lakukan *adaptive deload* (kurangi durasi repetisi 50% atau ganti sesi kualitas dengan Easy Run):
1. **RHR Pagi Naik**: Detak jantung istirahat pagi hari naik $> 5$ bpm di atas baseline (46 bpm).
2. **Kualitas Tidur Buruk**: Tidur terganggu 2 malam berturut-turut (skor tidur $< 70\%$ atau durasi $< 6$ jam).
3. **Kelelahan Sistem Saraf (CNS Fatigue)**: Kehilangan motivasi lari secara drastis atau merasa lesu sebelum mulai.
4. **Pace Terasa Berat**: Pace Easy atau Sub-T terasa jauh lebih berat dari biasanya pada output daya yang sama ($> 1$ tingkat RPE lebih tinggi).

---

## 4. [Sumber: NSA §2.4, §4.3] Kalibrasi Berkala & Ritme Race / Time Trial (TT)

- **Frekuensi Rekomendasi**: NSA menganjurkan mengikuti perlombaan (*race*, mis. 5K/parkrun) atau melakukan *time trial* (TT 3K–5K) secara teratur tiap **4–8 minggu**.
- **Tujuan Ganda**:
  1. *Kalibrasi Aktual*: Memperbarui target pace, threshold pace, dan zona HR/Power berbasis kebugaran terkini (*current fitness*).
  2. *Stimulasi Neuromuskular & Pemecah Plateau*: Melatih toleransi usaha balap (*"remembering how to hurt"*) dan merangsang sistem neuromuskular kecepatan tinggi tanpa merusak adaptasi aerobik.
- **Reminder Kalibrasi >8 Minggu**: Jika kalibrasi VDOT atau threshold pace terakhir atlet sudah berusia $> 8$ minggu, sistem/coach wajib memberikan pengingat untuk menjadwalkan TT baru via `/calc-vdot`.
- **Fenomena "Racing Rust"**: Wajar jika performa atau sensasi di perlombaan/TT pertama setelah blok panjang latihan Sub-T terasa agak "berkarat" (*racing rust*) atau kaku. Tubuh memerlukan sedikit waktu untuk beradaptasi kembali dengan intensitas supra-ambang laktat — **jangan** dievaluasi sebagai tanda kemunduran kebugaran.

---

## 5. [Sumber: NSA §4.4] Timeline Adaptasi, Stagnasi Semu, & Konsistensi Jangka Panjang

- **Timeline Adaptasi Fisiologis**: Tubuh membutuhkan waktu **4–8 minggu** untuk adaptasi awal terhadap metode Norwegian Singles. Lonjakan performa nyata (*breakthrough*) umumnya baru terlihat setelah **3–6+ bulan** konsistensi tanpa putus.
- **Plateau / Stagnasi Semu**: Periode di mana performa terasa datar (*apparent stagnation*) adalah fenomena wajar dan sering kali mendahului lompatan adaptasi berikutnya.
- **Prinsip Interpretasi Coach**: Pelatih dan sistem dilarang *overreact* terhadap fluktuasi mingguan atau ketiadaan lonjakan performa dalam hitungan hari. Konsistensi jangka panjang pada intensitas terkontrol adalah kunci utama.

---

## 6. Workflow Analisis Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - Ambil data time-series 90 hari: `cols: ctl,atl,tsb,rampRate,eftp`.
   - Periksa CTL terkini dan tren kestabilan beban.
2. **`analyze_training_load`**:
   - Masukkan nilai CTL, ATL, TSB, Ramp Rate.
   - Evaluasi ACWR category, TSB zone, dan rekomendasi otomatis.
3. **`get_wellness_data`**:
   - Ambil metrik pemulihan: `restingHR`, `hrv`, `sleepScore`, `weight`.
   - Validasi keberadaan sinyal kelelahan (*Red Flags*).
4. **Validasi Usia Kalibrasi VDOT/Threshold Pace**:
   - Cek tanggal kalibrasi VDOT terakhir. Jika $> 8$ minggu, tandai reminder untuk melakukan TT.

---

## 7. Format Respons Laporan Training Load

```markdown
### 📊 Status Beban Latihan & Kebugaran Berkelanjutan (Norwegian Singles)

**Tanggal**: [Tanggal]

| Metrik | Nilai | Evaluasi & Zona |
|---|---|---|
| **CTL (Fitness Berkelanjutan)** | [X] | [Base Building / Productive Development / High Fitness] |
| **ATL (Fatigue Akut)** | [X] | [Terkendali / Akumulasi Kelelahan Tinggi] |
| **TSB (Kesiapan / Form)** | [X] | [Zona: Optimal Training / Fresh / High Risk] |
| **ACWR (Rasio Beban Kerja)** | [X.XX] | **[Sweet Spot (0.8–1.3) / Warning / Danger]** |
| **Ramp Rate** | [X] TSS/minggu | [Sweetspot (+1 s.d. +3) / Agresif] |
| **eFTP / CP Terkini** | [X] W | [vs. Baseline 293 W] |

---

### ⏱️ Audit Alokasi Durasi Latihan (Aturan 75/25 Waktu)
- **Total Durasi Lari Mingguan**: [X] Jam ([Y] Menit)
- **Total Durasi Kerja Sub-Threshold**: [Z] Menit ([Persentase]% dari total waktu)
- **Status Alokasi**: [🟢 Ideal (20–25%) / 🔴 Overreaching (>25% - Pangkas durasi Sub-T)]
- **Porsi Easy & Recovery Run**: [W]% (Target $\ge 75\%$, intensitas < 70% Max HR)

---

### 🛡️ Evaluasi Green Zone & Sinyal Pemulihan
- **Resting Heart Rate**: [RHR] bpm ([Normal baseline 46 bpm / Terdeteksi lonjakan])
- **Skor Kualitas Tidur**: [Sleep Score]%
- **Status Green Zone**: [🟢 Berada di Green Zone produktif / 🟡 Perlu perhatian / 🔴 Trigger Deload Adaptif]

---

### ⏱️ Status Kalibrasi & Ritme Race/TT [Sumber: NSA §2.4, §4.3]
- **Usia Kalibrasi VDOT/Threshold Terakhir**: [X] Minggu
- **Status**: [🟢 Terkalibrasi Aktif (<8 minggu) / ⚠️ Perlu Kalibrasi (>8 minggu — Jadwalkan TT 3K/5K via /calc-vdot)]
- **Catatan Timeline [Sumber: NSA §4.4]**: [Pengingat adaptasi 4-8 minggu / 3-6+ bulan konsistensi; jangan overreact terhadap stagnasi sesaat]

---

### 📋 Rekomendasi Beban Minggu Ini
- [Saran taktis terkait pemeliharaan rasio 75/25 dan jadwal sesi kualitas]
```