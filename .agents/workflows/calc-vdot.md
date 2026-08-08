---
description: Kalkulator VDOT dan zona pace lari berbasis Jack Daniels Running Formula. Hitung estimasi VO₂max dan 5 zona pace latihan dari hasil race atau sesi tempo tanpa memerlukan koneksi ke Intervals.icu.
---

# Workflow: `/calc-vdot`

Workflow ini digunakan untuk menghitung **VDOT** (estimasi VO₂max) dan **5 Zona Pace Latihan** dari hasil race atau sesi tempo menggunakan MCP tool `calculate_vdot` dan `calculate_pace_zones`.

---

## Format Prompt Penggunaan

**Dari hasil race:**
```text
/calc-vdot

- Hasil Race: [HH:MM:SS atau MM:SS] — [Jarak]
- Contoh: 45:30 — 10K
```

**Dari threshold pace:**
```text
/calc-vdot threshold [MM:SS]/km
- Contoh: /calc-vdot threshold 5:30/km
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User

Ekstrak dari input user:
- `raceTime`: Waktu race format `MM:SS` atau `HH:MM:SS`.
- `distance`: Jarak dalam km (misal: 5, 10, 21.1, 42.2).
- Jika mode threshold: `thresholdPacePerKm` format `MM:SS`.

---

### Step 2: Panggil MCP Calculator Tools

**Mode Race Result:**
1. **`calculate_vdot`**:
   - `raceTime`: Waktu race.
   - `distanceKm`: Jarak dalam kilometer.

2. **`calculate_pace_zones`**:
   - `vdot`: Hasil dari langkah 1.

**Mode Threshold Pace:**
1. **`calculate_pace_zones`** langsung:
   - `thresholdPacePerKm`: Pace threshold per km.

---

### Step 3: Generate VDOT & Pace Zone Report

```markdown
### Hasil Kalkulasi VDOT

**Input**: [Waktu] — [Jarak] (atau Threshold Pace: [Pace])
**VDOT Score**: [X] ([Kategori: Beginner/Intermediate/Advanced/Elite])

### Zona Pace Latihan (Jack Daniels)

| Zona | Tipe Lari | Target Pace (/km) | Penggunaan |
|---|---|---|---|
| Easy | Recovery / Long Run | [X:XX – X:XX] | Lari santai, bisa ngobrol |
| Marathon | Race Pace HM/FM | [X:XX – X:XX] | Pace lomba maraton |
| Threshold | Tempo Run | [X:XX – X:XX] | Comfortably hard, 20–60 menit |
| Interval | VO₂max Reps | [X:XX – X:XX] | Repetisi 3–5 menit |
| Repetition | Speed Reps | [X:XX – X:XX] | Sprint 200–400m |

**Catatan**: [Bandingkan dengan threshold pace dan FTP yang terkonfigurasi di profil atlet]
```

---

### Step 4: Kontekstualisasi ke Program Latihan Atlet

Setelah kalkulasi, berikan catatan singkat:
- Bandingkan Threshold Pace dari VDOT dengan nilai `threshold_pace` di profil atlet.
- Apakah nilai FTP/CP di Intervals.icu sudah sesuai dengan performa race terkini?
- Rekomendasi: apakah CP/FTP perlu diupdate di Intervals.icu jika ada gap signifikan.
