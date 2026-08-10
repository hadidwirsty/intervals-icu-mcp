---
description: Backward Planning (Backcasting) kalkulator makrosiklus latihan dari tanggal Race Day. Menghitung mundur minggu latihan (13-18 minggu) dan mengategorikan Race A (Target Utama), Race B (Tune-up), & Race C (Training Run).
---

# Workflow: `/backcast-plan`

Workflow ini digunakan untuk menyusun **Makrosiklus Program Latihan (Macrocycle Timeline)** dengan prinsip **Backward Planning (Backcasting)** dan **Hirarki Kategorisasi Race (Race A, B, C)** sesuai metodologi Coach Faris Salman. Perencanaan dimulai dari **Race A (Target Utama)**, lalu menghitung mundur jumlah minggu total dan membaginya ke dalam 4 blok periodisasi.

---

## Hirarki Kategori Race (Coach Faris Salman)

1. 🥇 **Race A (Main Goal / Target Utama)**:
   - Target puncak performa tahunan/musim ini (misal: Half Marathon / Full Marathon).
   - Membutuhkan **Tapering Penuh 2–3 minggu** (penurunan volume -35%) dan kesegaran fisik puncak (TSB +5 s.d. +15).
   - Seluruh hitung mundur 13/18 minggu dijangkarkan ke tanggal Race A.

2. 🥈 **Race B (Tune-Up Race / Simulated Race)**:
   - Perlombaan perantara di tengah program (ditempatkan pada **Week 8 atau Week 10**).
   - Tujuan: Simulasi *race pace*, pengujian strategi nutrisi/gel, dan penyetelan *race execution*.
   - **Tanpa Tapering Panjang**: Hanya butuh *mini-taper* (2–3 hari deload ringan) sebelum race, lalu kembali ke ritme latihan normal.

3. 🥉 **Race C (Training Run / Fun Run / Community Event)**:
   - Event lari bersama komunitas atau fun run 5K/10K.
   - Purpose: Murni diperlakukan sebagai **Easy Aerobic Run** atau pengganti **Long Run Z2**.
   - **Tanpa Tapering Sama Sekali**: Berlari di bawah ambang batas (Zone 2 Aerobic 75–82% CP) tanpa memburu Personal Best.

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

### Step 1: Parse Input User & Hitung Tanggal Mulai
1. Ekstrak `raceDate` (format `YYYY-MM-DD`) sebagai **Race A Target Date** dan `raceType` (`HM` atau `FM`).
2. Tentukan Durasi Total Minggu:
   - `HM` (Half Marathon) = **13 Minggu** (sesuai P^3 NSA Lv 3 Blueprint).
   - `FM` (Full Marathon) = **18 Minggu**.
3. **Hitung Mundur Tanggal Mulai (Week 1 Start Date)**:
   $$\text{StartDate} = \text{RaceDate} - (N \text{ minggu} \times 7 \text{ hari})$$

---

### Step 2: Pembagian 4 Blok Periodisasi & Alokasi Race A, B, C

Susun `N` minggu tersebut ke dalam 4 blok latihan utama:

| Blok | Nama Fase | Rentang Minggu | Karakteristik & Alokasi Kategori Race |
|---|---|---|---|
| **Blok 1** | **General Aerobic Base** | Week 1 – 4 | EZ runs 35m → 40m, Long Run 90m → 100m. Slot ideal untuk **Race C (Fun Run Z2)** di Wk 3/4. |
| **Blok 2** | **Specific Build & Test I** | Week 5 – 8 | SubII & SubI density, `3/12 CP Test` (Wk 8). Slot ideal untuk **Race B (Tune-Up 10K/15K)** di Wk 8. |
| **Blok 3** | **Peak Volume & Race Prep** | Week 9 – 11 | Peak Long Run 160m (HMP Tempo), `20' Test` (Wk 11). Slot opsional **Race B (HM Tune-Up)** di Wk 10. |
| **Blok 4** | **Tapering & Race Execution** | Week 12 – 13 | Penurunan volume -35%, TSB Fresh (+5 s.d. +15). Eksekusi **RACE A (HARI-H TARGET UTAMA)** di Wk 13! |

---

### Step 3: Panggil MCP Tools untuk Verifikasi & Catatan Kalender

1. **`get_athlete_profile`**:
   - Ambil CP/FTP, LTHR, dan Threshold Pace aktif untuk memberikan target Watt/Pace per blok.
2. **`add_or_update_note`** *(Opsional jika disetujui atlet)*:
   - Tambahkan catatan "Week 1 Start", "Race B Tune-Up", dan "Race A Day" langsung ke kalender Intervals.icu.

---

### Step 4: Generate Backcasting Macrocycle Report

```markdown
### 🗓️ Laporan Backward Planning (Backcasting Macrocycle & Race Hierarchy)

**🥇 Target Race A (Main Goal)**: [Race Type: HM/FM] ([Target Date: YYYY-MM-DD])
**Tanggal Wajib Mulai (Week 1)**: [Calculated Start Date: YYYY-MM-DD]
**Total Durasi Program**: [N] Minggu | **Profil Baseline**: CP [X]W | LTHR [X] bpm

---

### 🗺️ Timeline 4 Blok Latihan Terbalik & Slot Race A, B, C

#### Blok 1: General Aerobic Base (Week 1 – 4) | [Start Date] — [End Date]
- **Fokus**: Aerobic Engine Development & Continuous Volume.
- **Volume Mingguan**: 4h55m → 5h30m (35–40 km/wk).
- **Long Run Slot**: Sabtu 90m → 100m (Pure Aerobic 75–82% CP).
- **🥉 Race C Opportunity**: Bisa ambil Fun Run 5K/10K di Minggu ke-3 (Wajib lari santai Z2 Aerobic).

#### Blok 2: Specific Build & Testing (Week 5 – 8) | [Start Date] — [End Date]
- **Fokus**: Subthreshold Density & Specific Endurance.
- **Volume Mingguan**: 5h30m → 6h15m (42–50 km/wk).
- **Long Run Slot**: Sabtu 110m → 130m (MP Tempo / Fartlek).
- **🥈 Race B Opportunity**: Slot ideal untuk **Tune-Up Race 10K** di Minggu ke-8 (Mini-taper 2 hari, evaluasi *race pace*).
- **Checkpoint**: `3/12 CP Test` di akhir Week 8 untuk re-kalkulasi CP & W'.

#### Blok 3: Peak Volume & Race Prep (Week 9 – 11) | [Start Date] — [End Date]
- **Fokus**: Peak Loading & Race Pace Specificity.
- **Volume Mingguan**: Peak 6h50m (52–58 km/wk).
- **Long Run Slot**: Sabtu 140m → 160m (HMP Tempo / HMP Separation).
- **Workout Slot**: Mixed Spektrum Intervals & `20' Test` (Week 11).

#### Blok 4: Tapering & Race Execution (Week 12 – 13) | [Start Date] — [End Date]
- **Fokus**: Glycogen Supercompensation & Neuromuscular Freshness.
- **Volume Mingguan**: Penurunan volume 35% (3h40m → 2h15m).
- **TSB Target**: +5 s.d. +15 (Fresh / Race Ready).
- **🥇 RACE A DAY**: **[Tanggal Target]** — Execute Race Strategy & Peak Performance!
```
