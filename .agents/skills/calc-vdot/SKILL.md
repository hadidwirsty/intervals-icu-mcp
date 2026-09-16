---
name: calc-vdot
description: Kalkulator VDOT dan zona pace lari berbasis Jack Daniels Running Formula. Digunakan sebagai titik awal estimasi pace Sub-Threshold dan Easy Run untuk Norwegian Singles Training Method.
---

# Skill: `/calc-vdot` — VDOT & Pace Estimator

Skill ini digunakan untuk menghitung skor **VDOT** dan **Zona Pace Lari** dari hasil uji coba waktu (*time trial*) atau perlombaan terkini menggunakan MCP tool `calculate_vdot` dan `calculate_pace_zones`, sebagai panduan penetapan pace *Sub-Threshold* dan *Easy Run* pada **Norwegian Singles Training Method** (`docs/references/norwegian-singles/`).

---

## 1. Peran VDOT dalam Norwegian Singles

Dalam literatur Norwegian Singles:
- VDOT dan prediktor waktu balap digunakan sebagai **panduan estimasi awal** (*starting points*) untuk memetakan pace repetisi sub-threshold (pace 10k, 15k, HM, dan 30k).
- **Pace adalah panduan, bukan target mutlak**: Beban internal (laktat, detak jantung, power) tetap menjadi pengendali utama. Jika cuaca panas/lembab atau kelelahan terjadi, pace wajib diturunkan agar intensitas tetap di bawah LT2.
- **Zona di Atas LT2 (Interval & Repetition)**: Zona *Interval* (VO₂max) dan *Repetition* (anaerobik) umumnya **tidak digunakan** dalam fase persiapan umum Norwegian Singles guna meminimalkan stres glikolitik tinggi dan menjaga repetabilitas latihan.

---

## 2. Format Prompt Penggunaan

**Dari hasil race atau time trial (contoh: 5K atau 10K):**
```text
/calc-vdot

- Hasil Race: [HH:MM:SS atau MM:SS] — [Jarak]
- Contoh: 24:30 — 5K
```

**Dari threshold pace spesifik:**
```text
/calc-vdot threshold 5:45/km
```

---

## 3. Langkah Eksekusi Sistem

### Step 1: Parse Input User
- Ekstrak waktu tempuh (`raceTime`) dan jarak (`distanceKm`).
- Atau ekstrak `thresholdPacePerKm`.

### Step 2: Panggil MCP Calculator Tools
1. **`calculate_vdot`**:
   - `raceTime`: Waktu race.
   - `distanceKm`: Jarak dalam kilometer.
2. **`calculate_pace_zones`**:
   - `vdot`: Skor VDOT dari langkah 1.

---

### Step 3: Hasilkan Laporan VDOT & Pace Guide NSA

```markdown
### 📊 Hasil Kalkulasi VDOT & Panduan Pace Norwegian Singles

**Input Benchmark**: [Waktu] — [Jarak] (atau Threshold Pace: [Pace])  
**Skor VDOT**: [X] ([Kategori Kebugaran])

---

### 🎯 Panduan Pace Sub-Threshold & Easy NSA

| Zona / Jarak Acuan | Target Pace (/km) | Bioenergetika & Penggunaan di Norwegian Singles |
|---|---|---|
| **Easy / Recovery** | **[X:XX – X:XX]** | **75–80% Total Waktu**: Lari santai (< 70% Max HR, laktat < 1.3 mmol/L). |
| **Sub-T Long (30K)** | **[X:XX – X:XX]** | Repetisi panjang 10m–15m (r:60–120s walk). |
| **Sub-T Medium (HM)** | **[X:XX – X:XX]** | Repetisi 5m–8m (r:60s walk). |
| **Sub-T Short (15K)** | **[X:XX – X:XX]** | Repetisi 3m–5m (r:60s walk). |
| **Sub-T Micro (10K / CV)**| **[X:XX – X:XX]** | Repetisi pendek 1m–3m (r:30–60s walk). Batas atas LT2. |

> [!NOTE]
> **Catatan Zona di Atas LT2 (Interval & Repetition)**:
> Jack Daniels menyertakan zona Interval (VO₂max) dan Repetition (kecepatan anaerobik). Dalam filosofi murni *Norwegian Singles*, latihan keras di atas LT2 dihindari pada fase persiapan umum. Stimulus neuromuskular diperoleh secara aman melalui *strides* 15–20 detik atau time trial berkala (tiap 4–8 pekan).

---

### 📋 Korelasi dengan Profil Atlet di Intervals.icu
- Bandingkan estimasi Threshold Pace di atas dengan nilai profil atlet (`thresholdPace` & `ftp`).
- Jika terdapat peningkatan performa yang signifikan, tawarkan untuk memperbarui nilai baseline di profil Intervals.icu.
```
