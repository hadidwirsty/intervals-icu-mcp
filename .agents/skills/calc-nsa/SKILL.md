---
name: calc-nsa
description: Kalkulator matriks interval Norwegian Singles (Time-Based) untuk memproyeksikan target Pace dan Power berdasarkan VDOT atlet (10k, 15k, HM, 30k). Tabel waktu/repetisi/rest bersumber langsung dari norwegiansingles.run §2.2; pemetaan %CP per jarak adalah turunan personal (situs asli hanya memberi pace guide relatif, bukan %CP).
---

# Skill: `/calc-nsa`

Skill ini berfungsi sebagai kalkulator otomatis (Norwegian Singles Calculator) untuk menerjemahkan tabel generik interval *Time-Based* NSA menjadi target *Pace* (min/km) dan *Power* (Watt) yang dipersonalisasi untuk atlet.

---

## 1. Trigger & Format Penggunaan

Untuk memicu skill ini, pengguna hanya perlu mengetik:
```text
/calc-nsa
```

Atau jika ingin menggunakan VDOT/Tujuan khusus (opsional):
```text
/calc-nsa vdot=32
```

---

## 2. Langkah Eksekusi Sistem

Saat dipanggil, ikuti langkah-langkah berikut secara berurutan:

### Step 1: Ambil Data Atlet & Parameter Fisiologis
- Panggil MCP tool `get_athlete_profile` untuk mendapatkan data `ftp` (CP) atlet.
- Panggil MCP tool `calculate_vdot` atau merujuk ke data historis profil atlet (dari `.agents/rules/project-context.md`) untuk mendapatkan VDOT terkini.

### Step 2: Hitung Matriks NSA via MCP tool `calculate_nsa_matrix`
- Panggil MCP tool `calculate_nsa_matrix` dengan parameter:
  - `vdot`: skor VDOT atlet (misal `32`).
  - `criticalPowerWatts`: Critical Power (CP) atlet (misal `293`).
- Tool ini secara otomatis dan deterministik menghitung target Pace (min/km) dan Power (Watt) untuk seluruh 6 durasi interval time-based resmi NSA (§2.2): 10K/CV, 15K, HM, dan 30K.

### Step 3: Sajikan Matriks NSA (Time-Based Workouts & LacTrace Benchmark)
Berdasarkan hasil pemanggilan `calculate_nsa_matrix` dan profil VDOT atlet, sajikan ringkasan ambang fisiologis serta tabel terstruktur di bawah ini kepada pengguna:

```markdown
### 🎯 Benchmark Ambang Fisiologis (Ekuivalen LacTrace / Jack Daniels)
- **VDOT Target**: [VDOT] | **Critical Power (CP)**: [CP] W
- **Threshold Pace (LT2)**: ~[Threshold Pace] /km (titik batas laktat 3.0–4.0 mmol/L)
- **Easy Pace Ceiling (65% MAS)**: ~[Easy Pace Range] /km (< 70% HRmax / < 146–155 bpm)

### 📊 Matriks Norwegian Singles Calculator (Time-Based)

| Format Interval | Repetisi Baku | Pace Guide | Target Pace Presisi | Rentang Toleransi Lapangan (LacTrace Range) | Target Power Atlet (Watt) | Rest |
|---|---|---|:---:|:---:|:---:|---|
| **1 min** | 20–25x | 10k/CV pace | `[Pace 10k]` | [Pace 10k - 8s] – [Pace 10k + 4s] /km | **[Power 10k]** | 30s walk |
| **3 min** | 8–12x | 15k pace | `[Pace 15k]` | [Pace 15k - 1s] – [Pace 15k + 9s] /km | **[Power 15k]** | 60s walk |
| **5–6 min** | 5–8x | 15k pace | `[Pace 15k]` | [Pace 15k - 1s] – [Pace 15k + 9s] /km | **[Power 15k Long]** | 60s walk |
| **6–8 min** | 4–6x | Half marathon pace | `[Pace HM]` | [Pace HM - 1s] – [Pace HM + 9s] /km | **[Power HM]** | 60s walk |
| **10–12 min** | 3–4x | HM - 30k pace | `[Pace (HM+30k)/2]` | [Pace HM/30k - 1s] – [Pace HM/30k + 9s] /km | **[Power HM/30k]** | 60–120s walk |
| **15 min** | 3x | 30k pace | `[Pace 30k]` | [Pace 30k - 1s] – [Pace 30k + 9s] /km | **[Power 30k]** | 90–120s walk |

### 🗂️ Pemetaan ke Session Cards Resmi Terbaru (norwegiansingles.run / Copeland 2026)
Buku resmi Copeland (*"The Method"*) menyederhanakan durasi kualitas ke dalam 3 pilar utama (~3m, ~6m, ~10m) yang dipetakan ke 4 Kartu Sesi praktis:
- **Intro Card (30m total)**: 10m Warmup + **4x 3m** (r: 1m jog) + 5m Cooldown (12m kualitas).
- **Session Card A (Short Reps — ~3 Menit / 12–15K Pace)**:
  * *Shorter (40m total)*: 10m Warmup + **6x 3m** (r: 1m jog) + 7m Cooldown (18m kualitas).
  * *Standard (50m total)*: 10m Warmup + **8x 3m** (r: 1m jog) + 9m Cooldown (24m kualitas).
  * *Larger (60m total)*: 12m Warmup + **10x 3m** (r: 1m jog) + 9m Cooldown (30m kualitas).
- **Session Card B (Medium Reps — ~6 Menit / 20K–HM Pace)**:
  * *Shorter (40m total)*: 10m Warmup + **3x 6m** (r: 1m jog) + 10m Cooldown (18m kualitas).
  * *Standard (50m total)*: 12m Warmup + **4x 6m** (r: 1m jog) + 11m Cooldown (24m kualitas).
  * *Larger (60m total)*: 12m Warmup + **5x 6m** (r: 1m jog) + 14m Cooldown (30m kualitas).
- **Session Card C (Long Reps — ~10 Menit / 25–30K Pace)**:
  * *Shorter (40m total)*: 10m Warmup + **2x 9m** (r: 1m jog) + 11m Cooldown (18m kualitas).
  * *Standard (50m total)*: 12m Warmup + **2x 12m** (r: 1m jog) + 13m Cooldown (24m kualitas).
  * *Larger (60m total)*: 12m Warmup + **3x 10m** (r: 2m jog) + 14m Cooldown (30m kualitas).

> *Catatan Fisiologis & Kaidah Copeland 2026*:
> 1. **Pilar vs Micro Repetitions**: Repetisi 1 menit di 10k pace bukan menu baku default buku Copeland (tetap berguna sebagai variasi sesekali). 3 pilar baku adalah ~3m, ~6m, dan ~10m.
> 2. **Kaidah Jeda Istirahat**: Memperpendek jeda istirahat atau jogging lebih cepat **BUKAN target progresi**. Istirahat bertujuan membuang metabolit laktat.
> 3. **Critical Power sebagai Estimasi Model**: CP adalah estimasi model dan tidak identik dengan LT2 atau pembacaan laktat langsung. Target Watt di atas harus divalidasi dengan sensasi fisik (*comfortably hard* RPE 5–6/10) dan keterulangan (*repeatability*).
> 4. **Heart Rate (HR) Ceiling**: HR adalah batas pengaman (<168–172 bpm). Jika cuaca panas/lembap mendongkrak HR melampaui ambang batas, turunkan pace/power atau prioritaskan RPE terkontrol.
```

---

## 3. Integrasi & Saran Tindakan
Setelah menampilkan matriks, berikan rekomendasi kepada pengguna:
*"Apakah Anda ingin menjadwalkan salah satu sesi interval di atas ke kalender menggunakan `/create-workout`?"*