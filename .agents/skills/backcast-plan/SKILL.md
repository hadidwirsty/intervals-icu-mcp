---
name: backcast-plan
description: Backward Planning (Backcasting) kalkulator makrosiklus latihan dari tanggal Race Day. Menghitung mundur minggu latihan (13-18 minggu) dan mengategorikan Race A (Target Utama), Race B (Tune-up), & Race C (Training Run).
---

# Skill: `/backcast-plan`

Skill ini digunakan untuk menyusun **Makrosiklus Program Latihan (Macrocycle Timeline)** dengan prinsip **Backward Planning (Backcasting)** dan **Hirarki Kategorisasi Race (Race A, B, C)** sesuai metodologi Coach Faris Salman. Perencanaan dimulai dari **Race A (Target Utama)**, lalu menghitung mundur jumlah minggu total dan membaginya ke dalam 4 blok periodisasi.

---

## Hirarki Kategori Race & Taper Patterns (Coach Faris Salman)

Prinsip dasar periodisasi berakar pada fakta fisiologis bahwa **badan manusia tidak bisa berada dalam kondisi *peak state* terus-menerus**. Secara fisiologi, *peak state* hanya dapat dipertahankan **1–2 minggu** sebelum sistem saraf dan muskuloskeletal mengalami kelelahan (*load & fatigue management*). Karena itu, manajemen prioritas race adalah pendekatan berjenjang (*nuanced*), bukan saklar *on/off* (pilihan hitam-putih antara *full taper all-out finish* atau *DNS*).

### Matriks Taksonomi A/B/C Race & Tapering

| Kategori Race | Pasangan Pola Taper | Durasi Taper | Karakteristik Beban & Penyesuaian | Target RPE Pas Finish | Tujuan Utama |
|---|---|---|---|---|---|
| 🥇 **Race A** | **A-Taper** *(Full Taper)* | **10–14 Hari** (1–2 pekan) | **Kurangi volume, jaga intensitas**. Frekuensi lari mingguan **TETAP** (misal 5x/wk tetap 5x/wk). Reps dipotong ~50% (SubT 6x6' → 6x3', Strides 10x → 5x). Volume turun ke 75% lalu 50%. TSB Fresh (+5 s.d. +15). | **9–10 / 10** *(All-out)* | Target Puncak Musim / PB (Normal 1–2x/tahun untuk rekreasional). |
| 🥈 **Race B** | **B-Taper** *(Mini Taper)* | **4–6 Hari** | Eliminasi *severe stressor* (misal interval keras VO₂max). **Aturan Emas Subthreshold**: Jika ada sesi SubT, wajib berikan jeda minimal **4 hari sebelum hari B-Race**. Volume mingguan ~85%. | **8–9 / 10** *(Hampir all-out)* | *Tune-Up Race*, *Fitness Check*, rangkaian *CP Test* (5K/10K), gladiresik sepatu & nutrisi lomba. |
| 🥉 **Race C** | **C-Taper** *(No Taper)* | **0 Hari** *(No taper)* | **Tukaran dengan hard workout days**. Satu sesi *hard workout* mingguan ditukar menjadi *Easy Run* (atau jadikan C-Race sebagai sesi Quality/Long Run @ LT1). Volume mingguan tetap 100%. | **6–7 / 10** *(Controlled Training)* | Latihan spesifik (misal Marathon pace @ HM distance), simulasi logistik nyata (jam sarapan, warm-up, kerumunan start, fueling). |

---

### Doktrin "Ego Management" Joe Friel (*"Never Let Ego Disrupt Periodization"*)

> [!CAUTION]
> **Bahaya Terbesar Pelari: "Upgrade" C-Race Menjadi All-Out di Tengah Lomba!**
> Niat awal berangkat untuk C-Race (training run santai). Saat pemanasan merasa segar bugar, ada pelari di depan dengan tempo menarik, lalu atlet terbawa atmosfer dan melakukan **"upgrade" ke effort all-out**.
> Joe Friel menyebut jebakan ini: ***"Letting ego disrupt periodization."***
> 
> **Dampak Fatal**:
> 1. Terjadi kerusakan serat otot mikroskopis (*unplanned muscle damage*) yang parah.
> 2. Minggu berikutnya yang seharusnya diisi sesi latihan kunci berkualitas tinggi terpaksa diubah menjadi fase *emergency recovery*.
> 3. Kebugaran puncak di **Race A utama menjadi hancur berantakan** (berujung performa anjlok, DNF, atau DNS).
> 
> *Jika atlet sadar mudah lepas kendali atau dikuasai ego saat memakai BIB lomba, pelatih mewajibkan atlet berdamai dengan diri sendiri dan menunda mengambil event non-prioritas.*

---

## Format Prompt Penggunaan

**Perencanaan Half Marathon (Race A - 13 Minggu Default):**
```text
/backcast-plan 2026-10-18 HM
```

**Perencanaan Full Marathon (Race A - 18 Minggu Default):**
```text
/backcast-plan 2027-04-25 FM
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User & Formula Universal Backcasting (Coach Faris Salman)

1. Ekstrak `raceDate` (format `YYYY-MM-DD`) sebagai **Race A Target Date** dan `raceType` (`HM` atau `FM`).
2. **Formula Universal Backcasting**:
   - Hitung total minggu yang tersedia:
     $$\text{Total Minggu} = \frac{\text{Race Date} - \text{Tanggal Hari Ini}}{7 \text{ hari}}$$
   - Kurangi durasi **Tapering**:
     * `5K – HM`: 1–2 minggu (standar emas HM = 2 minggu: W12 & W13).
     * `HM – FM`: 2–3 minggu.
   - Sisa minggu efektif untuk Base + Build:
     $$\text{Minggu Efektif} = \text{Total Minggu} - \text{Tapering}$$
   - Bagi ke dalam **Blok 4 Mingguan**:
     * Fase **Build / Spesifik**: 2–3 blok (8–12 minggu).
     * **Sisa minggu yang berlebih dialokasikan untuk memperpanjang fase BASE Aerobik!**
     *(Filosofi: "Punya base kokoh sebelum latihan spesifik dimulai, bukan mengejar base mepet race")*.
3. Jika atlet memulai dari awal musim dengan blueprint standar:
   - `HM` (Half Marathon) = **13 Minggu** (sesuai P^3 NSA Lv 3 Blueprint).
   - `FM` (Full Marathon) = **18 Minggu**.
   $$\text{StartDate (Week 1)} = \text{RaceDate} - (N \text{ minggu} \times 7 \text{ hari})$$

---

### Step 2: Pembagian 4 Blok Periodisasi & Alokasi Race A, B, C

Susun `N` minggu tersebut ke dalam 4 blok latihan utama (standar 13 Minggu HM):

| Blok | Nama Fase | Rentang Minggu | Karakteristik & Alokasi Kategori Race |
|---|---|---|---|
| **Blok 1** | **General Aerobic Base** | Week 1 – 4 | EZ runs 35m → 45m, Long Run 90m → 100m. W4 Deload (-10%). Slot ideal untuk **Race C (Fun Run Z2)** di Wk 3/4. |
| **Blok 2** | **Specific Build & Test I** | Week 5 – 8 | SubII & SubI density, `3/12 CP Test` di Wk 8. Slot ideal untuk **Race B (Tune-Up 10K/15K)** di Wk 8. |
| **Blok 3** | **Peak Volume & Race Prep** | Week 9 – 11 | **W9**: Base Transisi.<br>**W10**: High Build (LR 110m + Fartlek, uji sepatu race).<br>**W11**: 👑 **THE REAL PEAK WEEK** (Volume tertinggi makrosiklus, LR terpanjang ~115–120m, HMP dress rehearsal). |
| **Blok 4** | **Tapering & Race Execution** | Week 12 – 13 | **W12**: Tapering 1 (Penurunan volume -30% s.d. -35%, jaga intensitas HMP).<br>**W13**: 🏁 **RACE WEEK** (Volume turun -50%, shakeout run, TSB Fresh +5 s.d. +15, HARI-H RACE A DAY!). |

---

### Step 3: Panggil MCP Tools untuk Verifikasi & Catatan Kalender

1. **`get_athlete_profile`**:
   - Ambil CP/FTP, LTHR, dan Threshold Pace aktif untuk memberikan target Watt/Pace per blok.
2. **`add_or_update_note`** *(Opsional jika disetujui atlet)*:
   - Tambahkan catatan "Week 1 Start", "Race B Tune-Up", "Peak Week W11", dan "Race A Day" langsung ke kalender Intervals.icu.

---

### Step 4: Generate Backcasting Macrocycle Report

```markdown
### 🗓️ Laporan Backward Planning (Backcasting Macrocycle & Race Hierarchy)

**🥇 Target Race A (Main Goal)**: [Race Type: HM/FM] ([Target Date: YYYY-MM-DD])
**Tanggal Wajib Mulai (Week 1)**: [Calculated Start Date: YYYY-MM-DD]
**Total Durasi Program**: [N] Minggu | **Profil Baseline**: CP [X]W | LTHR [X] bpm | Max HR: 209 bpm

---

### 🗺️ Timeline 4 Blok Latihan Terbalik & Slot Race A, B, C

#### Blok 1: General Aerobic Base (Week 1 – 4) | [Start Date] — [End Date]
- **Fokus**: Aerobic Engine Development & Continuous Volume.
- **Volume Mingguan**: 4h55m → 5h30m (35–40 km/wk).
- **Long Run Slot**: Minggu 90m → 100m (Pure Aerobic 75–82% CP).
- **🥉 Race C Opportunity**: Bisa ambil Fun Run 5K/10K di Minggu ke-3 (Wajib lari santai Z2 Aerobic).

#### Blok 2: Specific Build & Testing (Week 5 – 8) | [Start Date] — [End Date]
- **Fokus**: Subthreshold Density & Specific Endurance.
- **Volume Mingguan**: 5h30m → 6h15m (42–50 km/wk).
- **Long Run Slot**: Minggu 110m → 130m (MP Tempo / Fartlek).
- **🥈 Race B Opportunity**: Slot ideal untuk **Tune-Up Race 10K** di Minggu ke-8 (Mini-taper 2 hari, evaluasi *race pace*).
- **Checkpoint**: `3/12 CP Test` di akhir Week 8 untuk re-kalkulasi CP & W'.

#### Blok 3: Peak Volume & Race Prep (Week 9 – 11) | [Start Date] — [End Date]
- **Fokus**: Peak Loading & Race Pace Specificity.
- **W10 (High Build)**: LR 110m (~17–18 km), uji coba race shoe rotasi.
- **W11 (👑 THE REAL PEAK WEEK)**: Volume puncak program (55–60 km/wk), Long Run terpanjang, `20' Test` / HMP tempo dress rehearsal.

#### Blok 4: Tapering & Race Execution (Week 12 – 13) | [Start Date] — [End Date]
- **W12 (Tapering 1)**: Penurunan volume -30% s.d. -35%, kurangi durasi Easy & LR, pertahankan ketajaman intensitas.
- **W13 (Race Week)**: Penurunan volume -50%, shakeout run santai, TSB Target +5 s.d. +15 (Fresh / Race Ready).
- **🥇 RACE A DAY**: **[Tanggal Target]** — Execute Race Strategy & Peak Performance!
```

---

### Step 5: Protokol Dynamic Plan Revision On-the-Fly (Coach Faris Salman)

Rencana makrosiklus bukanlah dokumen kaku. Rencana **wajib direvisi di tengah jalan** jika salah satu dari 3 kondisi berikut terjadi:

1. 🚨 **Cedera atau Sakit**:
   - Segera batalkan target kenaikan volume (*build*).
   - Mundur ke fase **Maintenance (0%)** atau **Deload Week (-10%)**. Jangan pernah memaksakan target kilometer/TSS saat tubuh melawan infeksi atau inflamasi jaringan!
2. 🚨 **Baseline di Strava / Intervals.icu Turun**:
   - Jika minggu-minggu kemarin ada sesi bolong karena urusan pekerjaan atau perjalanan dinas, **hitung ulang baseline dari data 42 hari riil terkini**.
   - Sesuaikan target minggu berikutnya berdasarkan kebugaran aktual saat ini, bukan memaksakan target angka lama di atas kertas!
3. 🚨 **Sinyal Recovery Buruk 2 Minggu Berturut-turut**:
   - Jika RHR pagi naik > 5 bpm, kualitas tidur buruk, atau easy pace terasa berat selama 2 pekan berturut-turut, **segera perpanjang minggu Deload atau Maintenance** sebelum melanjutkan ke fase berikutnya.
