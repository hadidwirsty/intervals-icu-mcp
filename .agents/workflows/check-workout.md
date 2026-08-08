---
description: Cek jadwal planned workout mendatang dari kalender Intervals.icu. Menampilkan daftar sesi yang sudah dijadwalkan berikut target power/HR/pace yang sudah di-resolve berdasarkan profil terkini.
---

# Workflow: `/check-workout`

Workflow ini digunakan untuk melihat **jadwal planned workout mendatang** dari kalender Intervals.icu secara otomatis, berikut target Watt/BPM/Pace yang sudah dikalkulasi berdasarkan profil atlet terkini.

---

## Format Prompt Penggunaan

**Cek 7 hari ke depan (default):**
```text
/check-workout
```

**Cek rentang tanggal spesifik:**
```text
/check-workout 2026-08-08 2026-08-15
```

**Cek satu workout spesifik berdasarkan event ID:**
```text
/check-workout id [event_id]
```

---

## Langkah Eksekusi Sistem

### Step 1: Parse Input User

- Jika tidak ada argumen → `startDate` = hari ini, `endDate` = 7 hari ke depan.
- Jika ada 2 tanggal → gunakan sebagai `startDate` dan `endDate`.
- Jika ada `id [event_id]` → gunakan mode detail satu workout.

---

### Step 2: Fetch Data dari MCP Intervals.icu

**Mode Daftar Mingguan:**
1. **`get_workout_library`**:
   - `startDate`: Tanggal mulai.
   - `endDate`: Tanggal akhir.
   - `sport`: `Run` (filter hanya lari, sesuaikan dengan sport Anda).
   - `resolve`: `true` (hitung target Watt/BPM/Pace berdasarkan profil aktif).

2. **`get_athlete_profile`** (Verifikasi profil aktif):
   - Ambil `ftp`, `lthr`, `thresholdPace` terkini untuk konfirmasi konteks kalkulasi.

**Mode Detail Satu Workout:**
1. **`get_workout_by_id`**:
   - `eventId`: ID event yang diinput.
   - `resolve`: `true`.

---

### Step 3: Generate Workout Schedule Report

```markdown
### Jadwal Workout Mendatang

**Periode**: [Tanggal Mulai] — [Tanggal Akhir]
**Profil Aktif**: CP [X]W | LTHR [X] bpm | Threshold Pace [X:XX]/km

| Tanggal | Hari | Nama Sesi | Durasi Target | Target Power | Target HR | Keterangan |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | [Hari] | [Nama Sesi] | [X] menit | [X–X] W | < [X] bpm | [Blueprint] |
| ... | | | | | | |

**Catatan Coach**:
- [Apakah jadwal sudah sesuai dengan blueprint program latihan Anda?]
- [Ada workout yang targetnya perlu disesuaikan dengan kondisi terkini?]
```
