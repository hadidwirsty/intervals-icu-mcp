---
description: Jadwalkan planned workout berstruktur di kalender Intervals.icu atlet menggunakan Teks DSL Intervals.icu via MCP tool create_running_workout.
---

# Workflow: `/create-workout`

Workflow ini digunakan untuk membuat dan menjadwalkan **Planned Workout Berstruktur** secara otomatis di kalender Intervals.icu atlet menggunakan Teks DSL Intervals.icu via MCP tool `create_running_workout`.

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

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User
Ekstrak parameter berikut dari input user:
- `name`: Judul workout (contoh: "Subthreshold I").
- `startDate`: Tanggal pelaksanaan YYYY-MM-DD.
- `startTime`: Waktu jam HH:MM (default: "06:00").
- `description`: Teks DSL Workout Intervals.icu.

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