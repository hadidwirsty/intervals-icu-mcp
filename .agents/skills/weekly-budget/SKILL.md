---
name: weekly-budget
description: Kalkulator alokasi durasi latihan mingguan atlet berbasis Norwegian Singles Training Method. Menghitung total waktu latihan mingguan (5–9 jam) dan membaginya sesuai aturan baku 20–25% Sub-Threshold dan 75–80% Easy Run.
---

# Skill: `/weekly-budget`

Skill ini digunakan untuk menghitung **Alokasi Durasi Latihan Mingguan (Weekly Training Budget Report)** secara otomatis berdasarkan data durasi dan beban latihan dari Intervals.icu via MCP, berlandaskan prinsip baku **Aturan Durasi 75/25 dari Norwegian Singles Training Method** (`docs/references/norwegian-singles/`).

---

## 1. Prinsip Utama Alokasi Durasi NSA

1. **Volume Berbasis Waktu (Hours/Week)**:
   - Pelari rekreasional beroperasi di koridor **5 hingga 9 jam per minggu**.
   - *"Distance proposes, physiology and duration dispose"* — adaptasi aerobik dikendalikan oleh durasi waktu di zona bioenergetika, bukan jarak kilometer.
2. **Aturan 20–25% Sub-Threshold & Evolusi Proporsi [Copeland 2026]**:
   - Total durasi akumulasi sesi kerja *Sub-Threshold* dibatasi ketat sekitar **20–25% dari total durasi waktu lari mingguan**.
   - Seiring volume total bertambah tinggi, porsi ini secara alami bergeser ke arah **20–22%** (dilarang memanjangkan durasi workout semata-mata demi mengejar 25%).
   - Beban ini didistribusikan ke dalam 2 hingga 3 sesi kualitas per minggu.
3. **Aturan 75–80% Easy & Recovery [Formula Long Run Copeland 1.7x]**:
   - 75–80% dari total waktu wajib berupa lari santai berintensitas rendah (< 70% Max HR atau < 65% MAS).
   - Long Run santai dihitung berdasarkan panduan awal Copeland: **~1.7 kali durasi Easy Run biasa** (contoh: Easy 45 menit $\rightarrow$ Long Run ~75–80 menit; pada volume tinggi mencapai 95–105 menit). Durasi 75–90 menit sudah optimal untuk target 5k hingga Half Marathon.
   - Sisa durasi dibagi merata ke 3–4 sesi Easy Run (masing-masing 40–50 menit, cap 60 menit ketat).

---

## 2. Aturan Progresi Beban Latihan [Sumber: NSA §2.3, §2.4 Copeland 2026]

> *"Start from recent training... Consolidate before increasing: at least a month at a manageable level, then a small intermediate increase held for another two or three weeks... Add time gradually: adding one 3-minute repetition across the whole week could be paired with about 12 extra easy minutes, distributed across existing runs... Shortening recovery or jogging faster is NOT a progression target."*

### 5 Pilar Progresi Copeland ("The Plans" §2.4):
1. **Start from recent training**: Berangkat dari beban volume yang stabil dan sudah dapat ditoleransi tubuh saat ini.
2. **Consolidate before increasing**: Tahan beban pada level yang bisa dikelola minimal **1 bulan**, lalu kenaikan kecil berikutnya ditahan **2–3 minggu**. Kesiapan fisik jauh lebih penting daripada sekadar menyelesaikan blok kalender kaku.
3. **Add time gradually (+1 rep 3m $\leftrightarrow$ +12m Easy)**: Setiap menambah 1 repetisi 3 menit Sub-T (+3m kerja kualitas) dalam sepekan, wajib dipasangkan dengan menambah **~12 menit Easy Run santai** yang dibagi ke sesi lari santai yang sudah ada.
4. **Let the proportions evolve (20–22%)**: Pada volume yang lebih tinggi, porsi Sub-T secara alami berada di kisaran 20–22%. Jika volume mendekati ~8 jam pada lari tunggal (*singles*), pertimbangkan *easy doubles* bila realistis.
5. **Earn faster paces through fitness**: Uji kembali ambang menggunakan race atau time trial (tiap 4–8 minggu). Perbarui target hanya bila performa meningkat, bukan otomatis naik tiap minggu.

> 🛑 **Kaidah Tegas Rest Interval**: Memperpendek jeda istirahat atau berlari jogging lebih cepat antar repetisi **BUKAN target progresi**. Jeda istirahat bertujuan membuang laktat dan merestorasi sistem neuromuskular.

### 🔄 Aturan Baku Progresi: "Change One Thing at a Time" (norwegiansingles.run 2026)
| Keinginan Atlet | Tindakan yang Diizinkan | Yang Tetap Wajib Sama |
|:---|:---|:---|
| **Ingin lari sedikit lebih banyak** | Tambahkan beberapa menit lari santai pada satu sesi yang sudah ada, lalu evaluasi pemulihan. | Jumlah sesi kualitas, repetisi, dan pace/daya. |
| **Ingin kerja kualitas lebih banyak** | Ganti sebagian menit lari santai dengan kerja terkontrol (+1 rep 3m $\leftrightarrow$ +12m easy), lalu ulang dan evaluasi. | Total rasio mingguan seimbang, sesi kualitas lain, dan pace/daya. |
| **Ingin menambah sesi kualitas baru** | Ganti satu sesi lari santai hanya jika rutinitas saat ini sudah konsisten tertangani $\ge 1$ bulan. | Total waktu lari mingguan dan sesi kualitas lainnya. |
| **Ingin memperbarui target pace/daya** | Uji coba laju baru dari hasil race representatif (4–8 minggu terakhir). | Jumlah repetisi dan total waktu mingguan. |
| **Pulih dari pekan yang berat** | Perpendek sesi kualitas, ubah jadi lari santai, atau istirahat total. | Bebas, tidak ada kewajiban menaikkan apa pun. |

---

## 3. Format Prompt Penggunaan

**Budget mingguan otomatis (berdasarkan data aktivitas terbaru & CTL):**
```text
/weekly-budget
```

**Budget mingguan dengan target durasi kustom (contoh: 6 jam atau 7 jam per minggu):**
```text
/weekly-budget 6h
```
atau
```text
/weekly-budget 7h
```

---

## 4. Langkah Eksekusi Sistem

### Step 1: Parse Input & Ambil Data dari MCP Intervals.icu
1. Ekstrak `targetHours`: Jika user mengetik angka/jam (misal `6h`), gunakan nilai tersebut. Jika tidak, ambil total durasi latihan 7 hari terakhir atau gunakan estimasi durasi dari CTL terkini (default aman: **6.0 jam / 360 menit**).
2. Panggil `get_fitness_chart`:
   - Ambil data 90 hari: `cols: ctl,atl,tsb,rampRate`.
   - Ambil nilai **CTL terkini** dan **Ramp Rate**.
3. Panggil `get_athlete_profile`:
   - Ambil `ftp` (CP) dan `lthr` untuk referensi intensitas sesi.

---

### Step 2: Kalkulasi Alokasi Durasi via MCP tool `calculate_weekly_budget`

Panggil MCP tool `calculate_weekly_budget` dengan parameter:
- `targetHours`: target durasi dalam jam (misal `6.0`).
- `currentCtl`: nilai CTL atlet.
- `qualitySessionsCount`: `3` (standar) atau `2` (pemula §2.3).

Tool akan menghitung secara deterministik alokasi durasi $T$ menit:
1. **Total Alokasi Sub-Threshold ($T_{\text{subT}}$)**:
   $$T_{\text{subT}} = T \times 22.5\% \quad (\text{rentang: } 20\% - 25\%)$$
   - Jika **3 Sesi Kualitas (Selasa, Jumat, Sabtu / sesuai jadwal)**:
     - Durasi kerja per sesi = $T_{\text{subT}} / 3$ menit kerja (misal ~25–30 menit kerja per sesi).
   - Jika **2 Sesi Kualitas (Selasa & Jumat)**:
     - Durasi kerja per sesi = $T_{\text{subT}} / 2$ menit kerja (misal ~35–40 menit kerja per sesi).

2. **Total Alokasi Easy & Recovery ($T_{\text{easy}}$)**:
   $$T_{\text{easy}} = T - T_{\text{subT}} \quad (\text{rentang: } 75\% - 80\%)$$
   - **Long Run Easy (Minggu)**: 75 s.d. 90 menit (aerobik murni < 70% Max HR).
   - **Sisa Waktu Easy**: $T_{\text{easy}} - T_{\text{LR}}$ dibagi ke 3 atau 4 hari Easy Run (masing-masing 40–50 menit, cap 60 menit ketat).
   - **Evaluasi Guardrail §6.2**: Mengecek apakah target durasi $\ge 8.5$ jam (rekomendasi *easy doubles*), plafon kerja Sub-T (maks 40–50 menit / 10–12 km per sesi), dan catatan keselamatan.

---

### Step 3: Hasilkan Weekly Budget Report

```markdown
### 📊 Alokasi Durasi Latihan Mingguan (Norwegian Singles)
**Target Durasi Mingguan**: [X.X] Jam ([Total Menit] Menit) | **CTL Terkini**: [CTL] load

---

### 🎯 Distribusi Durasi: Aturan 75/25 Waktu

| Komponen Beban | Porsi Waktu | Total Durasi Mingguan | Rincian Alokasi per Sesi |
|---|:---:|:---:|---|
| **Sub-Threshold (Quality)** | **20–25%** | **[SubT Menit] Menit** | Dibagi ke [2 / 3] sesi: ~[Menit per Q] menit kerja/sesi |
| **Long Run Pure Aerobic** | ~20–25% | **[LR Menit] Menit** | 1 sesi Minggu: 75–90 menit (< 70% Max HR) |
| **Easy & Recovery Runs** | ~50–55% | **[Easy Menit] Menit** | Dibagi ke 3–4 sesi: 40–50 menit/hari (< 70% Max HR) |

---

### 🗓️ Rekomendasi Distribusi Sesi Mingguan (Pola E-Q-E-Q-E-Q-LR)

| Hari | Tipe Sesi | Target Durasi | Target Intensitas | Menu Rekomendasi |
|---|---|:---:|---|---|
| **Senin** | REST TOTAL | 0 mnt | — | Restorasi glikogen / Puasa Sunnah |
| **Selasa** | **Quality 1 (Sub-T)** | ~50–60 mnt *(WU+Set+CD)* | 85–95% CP (laktat 2.0–3.0) | `10x 3m` (r:60s walk) atau `25x 1m` (r:30s walk) |
| **Rabu** | Easy Aerobic Run | 40–45 mnt | 70–77% CP (< 70% HRmax) | Lari santai stabil, conversational |
| **Kamis** | Easy Recovery Run | 40–45 mnt | 60–77% CP (< 70% HRmax) | Recovery Run / Ngabuburit puasa |
| **Jumat** | **Quality 2 (Sub-T)** | ~50–60 mnt *(WU+Set+CD)* | 85–95% CP (laktat 2.0–3.0) | `6x 5m` (r:60s walk) atau `5x 6m` (r:60s walk) |
| **Sabtu** | Recovery Shakeout | 30–35 mnt | 60–68% CP (< 68% HRmax) | Regenerasi jaringan jelang Long Run |
| **Minggu**| **Long Run Aerobic** | 75–90 mnt | 70–77% CP (< 70% HRmax) | Aerobik murni, uji hidrasi & nutrisi |

---

### 🛡️ Guardrails Eksekusi Norwegian Singles [Sumber: NSA §6.2]
> *"Around 8-9 hours per week, you might find that you're running out of low-risk headroom with this approach. Running three easy runs per week for more than an hour each starts raising the injury risk, as does running more than 40-50 minutes or 10-12k for quality intervals... doubles might be a safer approach versus adding more time or distance to single runs."*

**Guardrail (a) — Batas Volume Total (Zona ±8–9 Jam/Minggu)**:
- Di kisaran volume **±8–9 jam/minggu**, atlet mulai kehabisan batas aman risiko rendah (*low-risk headroom*).
- Menjalankan 3 sesi Easy Run yang masing-masing $> 60$ menit mulai meningkatkan risiko cedera muskuloskeletal.
- **Solusi Mitigasi**: Jika volume mingguan ditingkatkan melampaui rentang ini, gunakan pendekatan **Easy Double Runs** (dua sesi santai pendek dalam 1 hari) daripada memperpanjang durasi satu sesi lari tunggal (*single runs*).

**Guardrail (b) — Batas Durasi & Jarak Sesi Kualitas (Berlaku di Semua Level Volume)**:
- **TERPISAH dari soal total volume mingguan**: Setiap sesi kualitas Sub-T memiliki batas aman independen:
  * **Maksimum 40–50 menit akumulasi WAKTU KERJA Sub-T per sesi**.
  * **Maksimum 10–12 km akumulasi JARAK KERJA Sub-T per sesi**.
- Batas ini berlaku mutlak di semua level volume (bukan hanya saat atlet berlatih 8–9 jam). Dilarang menyusun sesi interval Sub-T yang durasi repetisi bersihnya melampaui 50 menit kerja atau 12 km kerja.
- **Cap Durasi Sub-T Mingguan**: Total durasi akumulasi kerja Sub-T tetap tidak boleh melebihi 25% dari total durasi waktu mingguan.
- **Easy Run Wajib Santai**: Uji bicara (*talk test*) harus selalu lolos (bisa berbicara beberapa kalimat tanpa terengah-engah).
- **Istirahat Pasif**: Jeda antar repetisi Sub-T direkomendasikan berjalan santai atau berdiri.
```
