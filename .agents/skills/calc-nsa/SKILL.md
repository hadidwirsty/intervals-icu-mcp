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

### Step 3: Sajikan Matriks NSA (Time-Based Workouts)
Berdasarkan hasil pemanggilan `calculate_nsa_matrix`, sajikan tabel terstruktur di bawah ini kepada pengguna:

```markdown
### 📊 Matriks Norwegian Singles Calculator (Time-Based)

**VDOT Target**: [VDOT] | **Critical Power (CP)**: [CP] W

| Time | Repetitions | Pace Guide | Target Pace Atlet | Target Power Atlet | Rest |
|---|---|---|---|---|---|
| **1 min** | 25x | 10k/CV pace | `[Pace 10k]` | `[Power 10k]` | 30s |
| **3 min** | 10-12x | 15k pace | `[Pace 15k]` | `[Power 15k]` | 60s |
| **5-6 min** | 6-8x | 15k pace | `[Pace 15k]` | `[Power 15k]` | 60s |
| **6-8 min** | 5-6x | Half marathon pace | `[Pace HM]` | `[Power HM]` | 60s |
| **10-12 min** | 3-4x | HM - 30k pace | `[Pace (HM+30k)/2]` | `[Power (HM+30k)/2]` | 60-120s |
| **15 min** | 3-4x | 30k pace | `[Pace 30k]` | `[Power 30k]` | 90-120s |

> *Catatan Fisiologis*: Pace adalah proksi, Power adalah target turunan personal, dan Detak Jantung (HR) adalah batas mutlak. Jika HR menembus batas atas zona sub-threshold (Z2 Norwegia / Z2 Friel), kurangi target Pace/Power.
```

---

## 3. Integrasi & Saran Tindakan
Setelah menampilkan matriks, berikan rekomendasi kepada pengguna:
*"Apakah Anda ingin menjadwalkan salah satu sesi interval di atas ke kalender menggunakan `/create-workout`?"*