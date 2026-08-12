---
description: Otomasi analisis laporan sesi lari harian atlet dengan mengambil data langsung dari Intervals.icu via MCP dan menghasilkan coaching report presisi berbasis sains.
---

# Workflow: `/run-report`

Workflow ini digunakan untuk menghasilkan **Analisis Pasca-Sesi Lari** secara otomatis tanpa perlu mengunggah file CSV atau screenshot secara manual.

---

## Format Prompt Penggunaan

Atlet/User cukup memberikan informasi sesi dengan format:

```text
/run-report

- Hari/Tanggal: [Hari, DD Bulan YYYY] (contoh: Kamis, 6 Agustus 2026)
- Sesi Eksekusi: [Nama Sesi & Durasi Target] (contoh: Subthreshold I - 54 menit)
- RPE (Rating of Perceived Exertion): [Skala 1-10]/10
- Catatan Fisik: [Sensasi fisik, kendala, atau catatan tambahan]
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
Ekstrak parameter berikut dari pesan user:
- `tanggal`: Tanggal eksekusi sesi (format `YYYY-MM-DD`).
- `sesi_target`: Nama dan target durasi sesi.
- `rpe`: Tingkat RPE yang dilaporkan atlet.
- `catatan_fisik`: Catatan subjektif atlet.

---

### Step 2: Fetch Data dari MCP Intervals.icu

Panggil alat MCP `intervals-icu` secara berurutan:

1. **`get_activities`**:
   - `startDate`: Tanggal sesi (`YYYY-MM-DD`)
   - `endDate`: Tanggal sesi (`YYYY-MM-DD`)
   - Temukan aktivitas lari (`type == "Run"`) yang paling sesuai. Catat `id` aktivitas.

2. **`get_activity_details`**:
   - `activity_id`: `id` dari langkah 1.
   - Ambil metrik eksekusi: `icu_average_watts`, `icu_weighted_avg_watts`, `average_heartrate`, `max_heartrate`, `moving_time`, `elapsed_time`, `icu_training_load`, `icu_intensity`, `average_cadence`, `decoupling`.
   - **Ekstrak Profil Fisiologis & Berat Badan Aktif**: `icu_ftp` (CP/FTP), `icu_w_prime` (W'), `p_max`, `lthr`, `athlete_max_hr`, `icu_resting_hr`, `icu_weight` (Berat Badan kg).

3. **`get_wellness_data`** (Fatigue & Wellness Check):
   - Parameter: `startDate` dan `endDate` pada tanggal sesi.
   - Ambil data harian: `weight` (Berat Badan harian terkini — prioritas utama), `restingHR`, `hrv`, `sleepScore`, `ctl` (Fitness), `atl` (Fatigue) untuk pengecekan *Fatigue Flags*.
   - Prioritaskan nilai `weight` dari sini jika tersedia; gunakan `icu_weight` dari detail aktivitas sebagai fallback.

4. **`get_activity_intervals`**:
   - `activity_id`: `id` dari langkah 1.
   - Ambil rincian per lap / interval (Warmup, Work Reps, Recovery, Cooldown).

5. **`get_activity_streams`**:
   - `activity_id`: `id` dari langkah 1.
   - `keys`: `["watts", "heartrate", "cadence", "velocity_smooth"]`
   - Hitung efisiensi paruh pertama vs paruh kedua untuk verifikasi Aerobic Decoupling & Cardiac Drift.

---

### Step 3: Muat Skill Running Coach Analysis

Terapkan pengetahuan dan aturan dari skill `.agents/skills/running-coach-analysis/SKILL.md`:
- Gunakan profil fisiologis atlet (CP, W', LTHR, Max HR) yang diekstrak secara dinamis dari MCP.
- Cocokkan realisasi latihan dengan **Blueprint Workout** yang dikonfigurasi.
- Hitung Efficiency Factor (EF = Watts / HR).

---

### Step 4: Generate Coaching Report (Format Respons Wajib)

Hasilkan laporan evaluasi sesuai struktur 4 bagian berikut:

1. **Ringkasan Eksekusi**: Evaluasi kepatuhan target watt dan durasi waktu.
2. **Analisis Detail Fisiologis**: Decoupling, Cardiac Drift, Kadens, Efisiensi, Breakdown Interval.
3. **Key Findings**: Korelasi sensasi fisik RPE & catatan fisik dengan bukti data numerik.
4. **Rekomendasi Berikutnya**: Target operasional konkret untuk sesi hari berikutnya (target watt, target HR ceiling, durasi menit, & opsi penjadwalan otomatis via `/create-workout`).