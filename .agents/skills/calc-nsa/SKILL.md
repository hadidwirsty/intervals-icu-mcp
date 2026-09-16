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

> *Catatan Fisiologis & Dual-Control Protocol*:
> 1. **Pace Presisi vs Rentang Lapangan**: Target Pace Presisi adalah acuan ideal, sedangkan *Rentang Toleransi (LacTrace Range)* adalah jendela aman saat menghadapi variasi kontur jalan, tikungan, atau hembusan angin.
> 2. **Power (Watt) sebagai Navigasi Utama**: Target Power menjaga intensitas metabolik tetap konstan tanpa terpengaruh elevasi tanjakan/turunan.
> 3. **Heart Rate (HR) Ceiling**: HR adalah batas mutlak (Z2 Norwegia / ceiling <168–172 bpm). Jika detak jantung melewati batas ambang ini, segera turunkan pace ke batas toleransi bawah atau kurangi power.
```

---

## 3. Integrasi & Saran Tindakan
Setelah menampilkan matriks, berikan rekomendasi kepada pengguna:
*"Apakah Anda ingin menjadwalkan salah satu sesi interval di atas ke kalender menggunakan `/create-workout`?"*