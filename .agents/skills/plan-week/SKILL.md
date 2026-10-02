---
name: plan-week
description: Rancang jadwal latihan 1 pekan penuh (E-Q-E-Q-E-Q-LR) berbasis Norwegian Singles Training Method. Menghasilkan pratinjau tabel 7 hari dengan durasi 75/25 yang presisi dan menerbitkan seluruh sesi berstruktur ke kalender Intervals.icu secara satu-klik via MCP generate_weekly_plan dan create_running_workout.
---

# Skill: `/plan-week` — Norwegian Singles Weekly Planner

Skill ini digunakan untuk merancang dan menerbitkan **Jadwal Latihan 1 Pekan Penuh (Weekly Workout Plan)** ke kalender Intervals.icu atlet secara otomatis, berlandaskan prinsip baku **Aturan Durasi 75/25 dari Norwegian Singles Training Method** (`docs/references/norwegian-singles/`).

---

## 1. Format Prompt Penggunaan

**Rancang jadwal pekan depan (otomatis Senin terdekat, durasi default 6.0 jam):**
```text
/plan-week
```

**Rancang jadwal dengan target durasi kustom (contoh: 5 jam atau 7 jam):**
```text
/plan-week 5h
```
atau
```text
/plan-week 7h
```

**Rancang jadwal untuk tanggal Senin spesifik:**
```text
/plan-week 2026-09-21 6h
```

**Rancang jadwal dengan variasi khusus (fleksibel):**
```text
/plan-week 6h q1=micro_1m q2=dist_2000m
```
atau
```text
/plan-week 5h 2-quality (mode pemula / deload week §2.3)
```

---

## 2. Pola Distribusi Standar (E-Q-E-Q-E-Q-LR) & Sifat Adaptif

> [!IMPORTANT]
> **Blueprint Adaptif, Bukan Patokan Kaku**:
> Tabel di bawah adalah pola distribusi dasar (*baseline blueprint*). Jadwal latihan bersifat **dinamis dan berprogresi**:
> - **Progresi Durasi/Repetisi & Kaidah Copeland 2026**: Sesi Sub-Threshold berprogresi dari repetisi pendek ke repetisi lebih panjang (misal: 10x 3m $\rightarrow$ 8x 3.5m $\rightarrow$ 7x 4m $\rightarrow$ 6x 5m $\rightarrow$ 5x 6m) dengan menjaga total waktu kerja efektif di kisaran **~30 menit per sesi** (total ~60 menit Sub-T per pekan). Menurut Copeland ("The Plans" §2.4), setiap penambahan 1 repetisi 3 menit Sub-T wajib dipasangkan dengan penambahan **~12 menit Easy Run santai** agar rasio tetap seimbang, dan beban ditahan stabil minimal **1 bulan** sebelum dinaikkan kembali.
> - **Formula Long Run Copeland (§4.6)**: Durasi Long Run santai dipatok sekitar **~1.7 kali durasi Easy Run harian biasa** (misal Easy 45m $\rightarrow$ LR 75–80 menit; pada volume tinggi 95–105m).
> - **Fase Tapering (Jelang Race)**: Pada fase Taper (seperti fase 1–2 pekan menjelang Target Race), volume kerja Sub-T dipotong 30–50% (misal menjadi 6x 3m atau 4x 4m) guna memaksimalkan restorasi glikogen dan kesegaran neuromuskular, sementara intensitas pace/power tetap dipertahankan.
> - **Integrasi Kekuatan ("Hard Days Hard, Easy Days Easy")**: Mengadopsi prinsip Steve Magness, sesi kekuatan (*core & spinal stability* / McGill Big 3) dijadwalkan pada hari yang sama dengan lari Quality (Selasa & Jumat sore), memastikan hari Rabu, Kamis, dan Sabtu tetap murni pemulihan aerobik tanpa stres neuromuskular atau kompresi tulang belakang.

### Struktur Mingguan Berjenjang Resmi (norwegiansingles.run 2026)
Panduan resmi terbaru menyusun opsi cetak biru mingguan berbasis hari & jam:
- **3 Hari / Minggu (90 Menit total)**: 1 Quality (Intro 4x 3m = 12m Sub-T) + 2 Easy Runs.
- **4 Hari / Minggu (180 Menit / 3 Jam)**: 2 Quality (Card A Shorter 6x 3m & Card B Shorter 3x 6m = 36m Sub-T / 20%) + 2 Easy Runs.
- **6 Hari / Minggu (250 Menit / ~4.2 Jam)**: 3 Quality + 3 Easy Runs + 1 Hari Istirahat Total (Jadwal 6 hari latihan dengan Senin Rest Day / Puasa).
- **Full Routine (300 Menit / 5 Jam)**: 3 Quality (Card A, B, C = 72m Sub-T / 24%) + 4 Easy Runs (pola 7 hari tanpa istirahat penuh).
- **Larger Week (420 Menit / 7 Jam)**: 3 Quality versi Larger (90m Sub-T / 21.4%) + Easy Runs lebih panjang.

Untuk volume mingguan ~6 jam (~360 menit aktivitas), struktur jadwal standar tersusun sebagai berikut:

| Hari | Jam | Kategori | Sesi Latihan | Durasi Total | Kerja Sub-T / Fokus | Target Intensitas |
|---|---|---|---|---|---|---|
| **Senin** | — | **REST** | Rest Day (Puasa Sunnah & Pemulihan Glikogen) | 0 m | 0 m | Restorasi total |
| **Selasa** | 05:30 | **Quality 1** | Short Sub-T 10x 3m (r:60s walk) *(Card A)* | 55 m | 30 m Sub-T | 94–96% CP / 84–88% HR |
| | 16:30 | **Strength** | Strength: McGill Big 3 & Hip Armor (`/strength-guide`) | 25 m | Otot Inti & Lumbar | Beban tubuh / stabilitas isometrik |
| **Rabu** | 05:30 | **Easy** | Easy Aerobic Run + Strides 4x 15s | 45 m | 0 m (Murni Recovery) | 60–70% HR (≤155 bpm) |
| **Kamis** | 16:45 | **Easy** | Easy Recovery Run (Ngabuburit Puasa) | 45 m | 0 m (Murni Recovery) | 60–70% HR (Pace santai) |
| **Jumat** | 05:30 | **Quality 2** | Medium Sub-T 5x 6m (r:60s walk) *(Card B)* | 55 m | 30 m Sub-T | 92–95% CP / 85–88% HR |
| | 16:30 | **Strength** | Strength: McGill Big 3 & Hip Armor (`/strength-guide`) | 25 m | Otot Inti & Lumbar | Beban tubuh / stabilitas isometrik |
| **Sabtu** | 05:30 | **Easy** | Shakeout Recovery + Strides (4x 15s) | 35 m | 0 m (Murni Recovery) | 60–68% HR + Strides Z6 |
| **Minggu** | 05:30 | **Long Run** | Pure Aerobic Long Run (Diminishing Returns ≤90m) | 75 m | 0 m (Aerobic Base) | 60–70% HR (< 70% Max HR) |

> **Evaluasi Alokasi NSA**: Total Waktu Lari = 310 menit (~5.16 jam) | Total Waktu Kekuatan = 50 menit | Total Kerja Sub-T = 60 menit (**19.35%**, patuh koridor 20–25% NSA) | Easy Run = 250 menit (**80.65%**, patuh koridor 75–80% NSA) | Long Run = 75 menit (patuh plafon 75–90m §4.6 & hukum Magness).

---

## 3. Langkah Eksekusi Sistem

Saat dipanggil, ikuti alur 5 langkah berurutan di bawah ini:

### Step 1: Ambil Data Beban & Profil Fisiologis Atlet
1. Panggil MCP tool `get_fitness_chart` untuk mengecek:
   - Chronic Training Load (**CTL** terkini)
   - Acute Training Load (**ATL**)
   - Training Stress Balance (**TSB**)
   - **Ramp Rate** mingguan
2. Panggil MCP tool `get_athlete_profile` untuk mengekstrak data `ftp` (Critical Power = 293 W) dan `lthr` (188 bpm).
3. Jika kondisi TSB berada di *High Risk* (<-30) atau Ramp Rate > 5, berikan catatan peringatan dan sarankan opsi 2 sesi kualitas atau pemangkasan durasi.

### Step 2: Tentukan Tanggal Hari Senin
- Jika user menyertakan tanggal (misal `2026-09-21`), gunakan tanggal tersebut.
- Jika tidak ada tanggal, tentukan tanggal hari Senin terdekat (hari Senin pada pekan berikutnya, atau hari Senin pekan ini jika dipanggil tepat pada hari Senin).

### Step 3: Hasilkan Rencana Mingguan via MCP Tool `generate_weekly_plan`
Panggil MCP tool `generate_weekly_plan` dengan parameter:
- `startDateMonday`: tanggal Senin hasil Step 2.
- `targetHours`: target jam user (default: 6.0).
- `qualitySessionsCount`: 3 (standar) atau 2 (jika diminta mode pemula / deload).
- `q1Preset` / `q2Preset`: jika user meminta variasi menu Sub-T tertentu (contoh: `micro_1m`, `dist_1000m`, `dist_2000m`).
- `fastingDays`: default `["Monday", "Thursday"]`.

### Step 4: Sajikan Pratinjau Terstruktur (Preview Table)
Sajikan laporan pratinjau komprehensif kepada atlet:
1. Ringkasan Alokasi Waktu (Target jam, total menit lari, rasio Sub-T vs Easy, status guardrail).
2. Tabel Jadwal 7 Hari lengkap (Hari, Tanggal, Jam, Kategori, Nama Sesi, Durasi, Kerja Sub-T, Target Intensitas).
3. Rincian Teks DSL untuk setiap sesi lari yang akan diterbitkan.
4. **Pemberitahuan Konfirmasi**:
   ```markdown
   ---
   📢 **Konfirmasi Penerbitan Kalender**:
   Ketik **"Publish"** atau **"Setuju"** untuk menerbitkan ke-6 sesi latihan di atas secara langsung ke kalender Intervals.icu Anda.
   Jika ada sesi yang ingin disesuaikan (misal: jam lari, variasi interval, atau durasi), beri tahu saya sebelum penerbitan.
   ```

### Step 5: Penerbitan Batch ke Kalender Intervals.icu (Setelah Konfirmasi)
Setelah atlet memberikan konfirmasi persetujuan:
1. Lakukan perulangan untuk setiap sesi bertipe `WORKOUT` (Selasa s.d. Minggu):
   Panggil MCP tool `create_running_workout` dengan:
   - `name`: judul sesi (contoh: "Quality 1: Short Sub-Threshold 10x 3m")
   - `startDate`: tanggal sesi (YYYY-MM-DD)
   - `startTime`: jam mulai (contoh: "05:30" atau "16:45")
   - `description`: Teks DSL murni yang dihasilkan oleh engine
   - `workoutType`: "Run"
2. Tampilkan laporan sukses berisi daftar event yang berhasil dibuat di kalender Intervals.icu atlet.
