---
name: create-workout
description: Jadwalkan planned workout berstruktur di kalender Intervals.icu atlet menggunakan Teks DSL Intervals.icu via MCP tool create_running_workout.
---

# Skill: `/create-workout`

Skill ini digunakan untuk membuat dan menjadwalkan **Planned Workout Berstruktur** secara otomatis di kalender Intervals.icu atlet menggunakan Teks DSL Intervals.icu via MCP tool `create_running_workout`.

---

## Format Prompt Penggunaan

**Jadwalkan workout dengan waktu default (06:00):**
```text
/create-workout

- Judul: Subthreshold I
- Tanggal: 2026-08-11
- Teks DSL:
Warmup
- 12m 70-80% power, 70-80% pace

Main Set 6x
- 3m 95-98% power, 95-98% pace
- 1m 60-75% power, 60-75% pace

Cooldown
- 6m 70-80% power, 70-80% pace
```

**Jadwalkan workout dengan jam kustom (misal 05:00 pagi):**
```text
/create-workout

- Judul: Subthreshold II
- Tanggal: 2026-08-13
- Jam: 05:00
- Teks DSL:
Warmup
- 12m 70-80% power, 70-80% pace

Main Set 3x
- 6m 91-94% power, 91-94% pace
- 1m 60-75% power, 60-75% pace

Cooldown
- 6m 70-80% power, 70-80% pace
```



**Contoh 3: Short Sub-Threshold (Norwegian Singles)**
```text
/create-workout
- Judul: Short Sub-Threshold
- Tanggal: 2026-08-11
- Teks DSL:
Warmup
- 15m 65-75% HR

Intervals 20x
- 400m 84-88% HR
- 30s 0-60% HR

Cooldown
- 10m 60-70% HR
```

**Contoh 4: Medium Sub-Threshold (Norwegian Singles)**
```text
/create-workout
- Judul: Medium Sub-Threshold
- Tanggal: 2026-08-13
- Jam: 05:00
- Teks DSL:
Warmup
- 15m 65-75% HR

Intervals 8x
- 1000m 85-88% HR
- 60s 0-60% HR

Cooldown
- 10m 60-70% HR
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
Ekstrak parameter berikut dari input user:
- `name`: Judul workout (contoh: "Subthreshold I").
- `startDate`: Tanggal pelaksanaan YYYY-MM-DD.
- `startTime`: Waktu jam HH:MM (default: "06:00").
- `description`: Teks DSL Workout Intervals.icu.

> [!TIP]
> **Panduan Jadwal Waktu Eksekusi (Master Timetable)**:
> - **Default Pagi**: `startTime: "06:00"` (atau 05:30) berlaku umum untuk sesi latihan pagi hari.
> - **Sesi Sore / Custom**: Sesuaikan `startTime` jika ada preferensi sesi sore (contoh: `"16:45"` atau `"17:00"`).
> - **Hari Rest Total**: Tidak perlu menjadwalkan workout (0 load).

---

### Step 2: Fetch Profil Atlet (Verifikasi Context)

1. **`get_athlete_profile`**:
   - Dapatkan FTP/CP dan LTHR atlet untuk konfirmasi konteks kalkulasi.

---

### Step 3: Panggil MCP Tool `create_running_workout`

Panggil tool `create_running_workout`:
- `name`: Judul workout.
- `description`: Teks DSL yang sudah dikonstruksi.
- `startDate`: Tanggal `YYYY-MM-DD`.
- `startTime`: Jam `HH:MM` (default: "06:00").
- `workoutType`: `"Run"`.

System akan otomatis mengirim request POST ke Intervals.icu API (`/athlete/{id}/events`), yang secara otomatis mengomputasi durasi total, estimasi jarak, dan *Training Load* (TSS).

---

### Step 4: Generate Confirmation Report

```markdown
### ✅ Planned Workout Berhasil Dijadwalkan ke Kalender

- **Judul Sesi**: [Name]
- **Tanggal & Waktu**: [YYYY-MM-DD] pukul [HH:MM]
- **Tipe Olahraga**: Running (Run)
- **Status Kalender**: Terhubung & Sinkron dengan Garmin Connect / Perangkat GPS

**Struktur Teks DSL**:
```text
[DSL Description]
```

**Catatan**:
Sesi ini telah terkirim ke kalender Intervals.icu Anda. Saat perangkat GPS/Garmin Anda melakukan sync, sesi latihan berstruktur ini akan otomatis muncul pada perangkat Anda.
```
