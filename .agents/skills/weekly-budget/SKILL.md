---
name: weekly-budget
description: Kalkulator budget latihan mingguan atlet (Dual-Mode: Load TSS & Distance Km). Menghitung total budget mingguan dan alokasi beban per tipe sesi menggunakan CTL Multiplier System (Palladino Power Project) dengan target Ramp Rate sweetspot +1 s.d. +3 TSS/minggu.
---

# Skill: `/weekly-budget`

Skill ini digunakan untuk menghitung **Budget & Proporsi Latihan Mingguan (Weekly Training Budget Report)** secara otomatis berdasarkan data CTL (42-day average daily load) dari Intervals.icu via MCP tool `calculate_weekly_budget`, dengan distribusi beban per sesi berbasis **CTL Multiplier System dari Palladino Power Project**.

---

## Format Prompt Penggunaan

**Budget mingguan berbasis Load (TSS - Default):**
```text
/weekly-budget
```

**Budget mingguan berbasis Jarak (Kilometer / Km):**
```text
/weekly-budget distance
```

**Budget mingguan dengan target ramp rate kustom dalam TSS/minggu (misal: `1` maintenance, `2` normal build, `3` aggressive build):**
```text
/weekly-budget 3
```
> ⚠️ Input angka = **TSS/minggu** (bukan persen). Contoh: `3` berarti target kenaikan CTL **+3 TSS/minggu**.

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
- Ekstrak `mode`: `load` (default, TSS) atau `distance` (km).
- Ekstrak `targetRampPct`: Persentase kenaikan mingguan.
  - **Default: `2`** (setara kenaikan CTL ~+2 TSS/minggu, dalam sweetspot Palladino `+1 s.d. +3`).
  - Jika user menentukan angka → gunakan nilai tersebut.
  - Ingatkan user jika input `> 5` bahwa ini **High Risk** per standar Palladino.

---

### Step 2: Fetch & Calculate Data dari MCP Intervals.icu

1. **`get_fitness_chart`**:
   - `startDate`: 90 hari lalu (untuk hitung 30-Day Max TSS & 42d avg).
   - `endDate`: Hari ini.
   - `cols`: `ctl,atl,tsb,rampRate`
   - Ambil:
     - **CTL terkini** (= 42d average daily load, referensi semua kalkulasi multiplier).
     - **30-Day Max TSS** dari data historis (referensi Single Run Safeguard).
     - **Ramp Rate terkini** untuk evaluasi apakah sudah di sweetspot.

2. **`calculate_weekly_budget`**:
   - `avgDailyLoad`: Nilai CTL dari langkah 1.
   - `mode`: `load` atau `distance`.
   - `targetRampPct`: Nilai dari Step 1 (default: **2**).
   - Dapatkan `totalWeeklyBudget` (atau `totalWeeklyBudgetKm`) sebagai referensi total akumulasi beban.

3. **`get_athlete_profile`**:
   - Ambil `ftp` dan `lthr` untuk referensi intensitas sesi.

---

### Step 3: Kalkulasi Alokasi Beban & Jarak

#### A. Mode Load (TSS / Power — Default)
Gunakan **CTL Multiplier System** dari Palladino Power Project:

| Tipe Sesi | Range % CTL | Target Beban per Sesi | Batasan Kritis |
|---|---|---|---|
| **Easy / Recovery Run** | `70–90% CTL` | `0.70×CTL – 0.90×CTL` | **Cap durasi ≤ 50–60 menit**, intensitas ≤ 80% CP/FTP |
| **Moderate Aerobic Run** | `100–130% CTL` | `1.00×CTL – 1.30×CTL` | Mid-week, masih fully aerobic |
| **Interval / Tempo Session** *(inc. W/U & C/D)* | `125–175% CTL` | `1.25×CTL – 1.75×CTL` (maks 2.5× CTL sesi khusus) | Sesi kualitas (Subthreshold/VO₂max) |
| **Long Run (HM Prep)** | `150–200% CTL` | `1.50×CTL – 2.00×CTL` | Sesuaikan fase periodisasi aktif |

> [!TIP]
> **Aturan Easy Run Cap**: Ketika CTL meningkat dan beban mingguan perlu naik, **jangan perpanjang durasi Easy Run** melewati batas cap. Alokasikan kenaikan beban ke sesi Interval, Tempo, atau Long Run.

> [!IMPORTANT]
> **Single Run Safeguard (Frandsen et al. 2025 / Palladino)**:
> - `< 105%` → 🟢 Lower Risk | `105–109%` → 🟡 Modest Risk | `110–114%` → 🟠 Moderate Risk | `≥ 115%` → 🔴 High Risk

---

#### B. Mode Distance (Kilometer / Mileage — Formula Coach Faris Salman)
Berdasarkan *Deep Dive 1–6/9 Coach Faris Salman*, kalkulasi jarak mengadopsi prinsip Palladino & Frandsen tanpa persentase kaku:

1. **Weekly Budget Baseline**:
   $$\text{Baseline} = (\text{42d Average Daily km}) \times 7$$
   *Profil Risiko Kenaikan*:
   - 🔵 `> -10%` : Recovery / Taper
   - 🔵 `-3% s.d. -10%` : Deload Week
   - ⚪ `0%` : Maintenance
   - 🟢 **`+3% – +8%` : Main Aman (Safe Build)**
   - 🟡 `+8% – +15%` : Yakin Bisa Recovery
   - 🟠 `+15% – +25%` : Risiko Tinggi
   - 🔴 `+25%+` : Risiko Sangat Tinggi

2. **Max Long Run Budget**:
   $$\text{Plafon LR} = \min\big(3 \times \text{42d avg daily km},\ \text{90d Max LR} \times \text{Risk \%}\big)$$
   *Profil Risiko Frandsen vs 90d Max LR*:
   - 🟢 `~104%` : Main Aman
   - 🟡 `105–109%` : Yakin Bisa Recovery
   - 🟠 `110–114%` : Risiko Tinggi
   - 🔴 `115%+` : Risiko Sangat Tinggi

3. **Workout / Interval Budget**:
   $$\text{Plafon Workout} = (\text{42d Average Daily km}) \times \text{Multiplier}$$
   - 🟢 **`1.1 – 1.3×` (Aman)** — *contoh default: 1.2×*
   - 🟡 `1.3 – 1.5×` (Yakin Bisa Recovery)
   - 🟠 `1.5 – 2.0×` (Risiko Tinggi)
   *(Total volume harian termasuk Warmup, Cooldown, Strides, repetisi interval, dan rest)*.

4. **Easy Run Budget (Metode Sisa Anggaran / Subtraction)**:
   $$\text{Budget Easy Run} = \text{Total Weekly Budget} - \text{Km Long Run} - \text{Km Workout}$$
   Sisa kilometer dibagi rata ke jumlah hari easy:
   - Opsi 4 hari easy: $\text{Budget Easy} / 4$ km/hari
   - Opsi 3 hari easy: $\text{Budget Easy} / 3$ km/hari

---

### Step 4: Generate Weekly Budget Report

Hasilkan laporan evaluasi budget dengan format berikut:

```markdown
### 📊 Budget & Alokasi Latihan Minggu Ini
**Mode**: [Load TSS / Distance Km] | **Target Ramp / Kenaikan**: +[X]% ([Y] TSS/minggu atau [Y] km)

**Baseline (42d Avg)**: [CTL load/hari ATAU 42d avg km/hari] → Total Baseline: [X] [TSS/km]
**Ramp Rate / Risk Profile**: [Status: Main Aman 🟢 / Sweetspot / Yakin Recovery 🟡 / Risiko Tinggi 🟠]
**Total Weekly Budget**: [Total Budget] [TSS / km]

---

### 🎯 Alokasi Beban per Tipe Sesi

**Jika Mode Load (TSS)**:
| Tipe Sesi | Target Beban | Estimasi Durasi | Batas & Catatan |
|---|---|---|---|
| **Easy / Recovery Run** | [0.7×CTL] – [0.9×CTL] load | ≤ 50–60 menit | ≤ 80% CP, lolos talk test |
| **Moderate Aerobic Run** | [1.0×CTL] – [1.3×CTL] load | 60–75 menit | Steady aerobic, mid-week |
| **Interval / Tempo Session** | [1.25×CTL] – [1.75×CTL] load | 50–80 menit | Inc. Warmup & Cooldown (maks 2.5×) |
| **Long Run (HM Prep)** | [1.5×CTL] – [2.0×CTL] load | 90–140 menit | Sesuai fase periodisasi |

**Jika Mode Distance (Km — Coach Faris Salman)**:
| Komponen | Budget Jarak (km) | Formula / Konsep |
|---|---|---|
| **Total Weekly Budget** | [X] km | Baseline [B] km + [Ramp]% ([Kategori Risiko]) |
| **Max Long Run** | [X] km | min(Palladino 3x: [P] km, Frandsen: [F] km) |
| **Quality Workout** | [X] km | [1.2×] 42d avg km (total WU + Interval + CD) |
| **Easy Run (Sisa Budget)** | [X] km | Total Budget − LR − Workout |
| *Opsi Alokasi Easy* | [E4] km/hari (4 hari) ATAU [E3] km/hari (3 hari) | RPE 1–2, ≤ 80% CP |

---

### 🛡️ Single Run Safeguard — Long Run Check
- **30-Day Max TSS / 90-Day Max LR**: [X] load / [X] km
- **Target Long Run Minggu Ini**: [Y] load / [Y] km ([Rasio]%)
- **Status Risiko**: [🟢 Lower / 🟡 Modest / 🟠 Moderate / 🔴 High Risk]

---

### 📋 Panduan Eksekusi Mingguan
- **Easy Run**: Jaga intensitas santai (RPE 1-2, lolos talk test). Budget adalah plafon, eksekusi boleh kurang!
- **Quality Days**: Fokus pada eksekusi kualitas repetisi di target watt/pace.
- **Long Run**: Patuhi batas Single Run Safeguard sebelum memulai.
```
