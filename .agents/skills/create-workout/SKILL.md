---
name: create-workout
description: Jadwalkan planned workout berstruktur di kalender Intervals.icu atlet menggunakan Teks DSL Intervals.icu berbasis Norwegian Singles Training Method via MCP tool create_running_workout.
---

# Skill: `/create-workout` — Norwegian Singles Workout Builder

Skill ini digunakan untuk membuat dan menerbitkan **Planned Workout Berstruktur** secara otomatis ke kalender Intervals.icu atlet menggunakan format **Teks DSL Intervals.icu**, berlandaskan menu baku **Norwegian Singles Training Method** (`docs/references/norwegian-singles/`).

---

## 1. Format Prompt Penggunaan

**Jadwalkan workout dengan waktu default (05:30):**
```text
/create-workout

- Judul: Short Sub-Threshold
- Tanggal: 2026-09-15
- Teks DSL:
Warmup
- 15m 60-70% HR

Intervals 10x
- 3m 94-96% power, 84-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

**Jadwalkan workout dengan jam kustom (misal 16:45 sore untuk lari ngabuburit puasa):**
```text
/create-workout

- Judul: Easy Recovery Run
- Tanggal: 2026-09-17
- Jam: 16:45
- Teks DSL:
- 45m 60-70% HR
```

---

## 2. Pustaka Template Resmi Norwegian Singles (Intervals.icu DSL)

> [!IMPORTANT]
> **Aturan Baku Quality Session NSA (Dual-Control Protocol)**:
> - Warmup: **10–15 menit** @ **60–70% HR** *(HR Primary — menjaga intensitas tetap santai sebelum main set)*.
> - Cooldown: **10 menit** @ **60–70% HR** *(HR Primary — sama seperti Warmup)*.
> - Rest antar repetisi (`0-50% power, <60% HR`): Tetap **Dual Power + HR**, disarankan **BERDIRI atau BERJALAN SANTAI** (*Passive Walk Recovery* per NSA §2.2).
> - Strides: `110-130% power, 180-195 cadence` *(HR secondary dihilangkan karena durasi 15s mengalami HR lag)*.
> - Seluruh kerja kualitas (Main Set) beroperasi di koridor **Sub-Threshold (LT2, 85–95% CP, laktat 2.0–3.0 mmol/L)** dengan **Power Primary + HR Secondary**.
> - **Standarisasi Session Cards (norwegiansingles.run 2026)**: Seluruh template di bawah ini terpetakan ke dalam 4 format kartu sesi resmi: Intro Card (4x 3m), Session Card A (3m), Session Card B (6m), dan Session Card C (9–12m).
> - **Guardrail Durasi & Jarak Sesi Kualitas [Sumber: NSA §6.2]**: Sesi Sub-T TIDAK boleh melebihi **40–50 menit akumulasi waktu kerja** atau **10–12 km akumulasi jarak kerja** per sesi, berlaku mutlak di semua level volume. Seluruh template bawaan di bawah terverifikasi patuh (total akumulasi kerja berkisar 20–36 menit atau 6–10 km).

---

### A. Template Sub-Threshold Berbasis Waktu (Time-Based NSA)

#### 1. Micro Sub-Threshold (25x 1 Menit — 10k / CV Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 25x
- 1m 96-99% power, 84-88% HR
- 30s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

#### 2. Short Sub-Threshold (8–10x 3 Menit — 15k Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 10x
- 3m 94-96% power, 84-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

#### 3. Medium Sub-Threshold (5–6x 5–6 Menit — 15k s.d. HM Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 5x
- 6m 92-95% power, 85-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

#### 4. Long Sub-Threshold (3–4x 8–10 Menit — HM s.d. 30k Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 3x
- 10m 89-92% power, 84-88% HR
- 90s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

---

### B. Template Sub-Threshold Berbasis Jarak (Distance-Based NSA)

> [!NOTE]
> Gunakan satuan `km` atau `m` secara presisi: Pada DSL Intervals.icu, angka tanpa satuan atau `m` pada langkah lari diinterpretasikan sebagai **MENIT**. Untuk jarak meter, gunakan format `1000m` atau `2.0km`.

#### 1. Distance Sub-T: 8–10x 1000m (~10k s.d. 15k Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 8x
- 1000m 95-98% power, 84-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

#### 2. Distance Sub-T: 4–5x 2000m (~HM Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 4x
- 2000m 92-95% power, 85-88% HR
- 90s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

#### 3. Distance Sub-T: 2–3x 3000m (~30k Pace)
```text
Warmup
- 15m 60-70% HR

Intervals 3x
- 3000m 89-92% power, 84-88% HR
- 120s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR
```

---

### C. Template Easy Runs & Long Run

#### 1. Easy Aerobic Run (40–45 Menit — Rabu & Kamis)
```text
- 45m 60-70% HR
```

#### 2. Easy Aerobic + Neuromuscular Strides (Walk Recovery)
```text
Warmup
- 35m 60-70% HR

Intervals 5x
- 15s 110-130% power, 180-195 cadence
- 45s 0-50% power, <60% HR

Cooldown
- 5m 60-70% HR
```

#### 3. Recovery / Shakeout Run (30–35 Menit — Sabtu)
```text
- 35m 60-68% HR
```

#### 4. Long Run (Pure Aerobic) (75–90 Menit — Minggu, fase base - build)
```text
Warmup
- 15m 60-70% HR

- 55m 70-77% power, 60-70% HR

Cooldown
- 10m 60-70% HR
```

#### 5. Long Run (HM Spesific / Simulasi Opsional) (90 - 150 Menit — Minggu, opsi rehearsal pra-race)
> [!NOTE]
> **Reassurance Target HM [Sumber: NSA §5.1]**: Jarak 5K–HM adalah *sweet spot* utama Norwegian Singles di mana Long Run murni santai 75–90 menit (Template C.4) sudah sangat memadai tanpa perlu simulasi tempo-in-LR. Template rehearsal ini adalah adaptasi spesifik opsional, bukan kewajiban baku NSA untuk Half Marathon.
```text
Warmup
- 15m 60-70% HR

Steady Z2 Aerobic
- 45m 70-77% power, 60-70% HR

HMP Tempo Rehearsal 2x
- 10m 92-95% power, 84-88% HR
- 3m 65-75% power, 60-70% HR

Cooldown
- 9m 60-70% HR
```

#### 6. Long Run (30K Spesific) (120 - 180 Menit — Minggu, hanya dilakukan 3 minggu menjelang race)
```text
Warmup
- 15m 60-70% HR

Steady Z2 Aerobic
- 60m 70-77% power, 60-70% HR

30K Tempo Rehearsal 2x
- 15m 89-92% power, 84-88% HR
- 3m 65-75% power, 60-70% HR

Cooldown
- 10m 60-70% HR
```

---

## 3. Langkah Eksekusi Sistem

### Step 1: Validasi Durasi & Format Deskripsi
1. **Aturan 20–25% Sub-T & Cap 40–50 Menit [Sumber: NSA §6.2]**:
   - Pastikan total durasi repetisi kerja Sub-Threshold tidak melebihi alokasi mingguan atlet (20–25% total waktu lari mingguan).
   - Pastikan total waktu kerja Sub-T dalam satu sesi **tidak melebihi 40–50 menit kerja** atau **10–12 km kerja**.
2. **Pure Structured DSL Only**: Teks parameter `description` **HANYA** boleh memuat langkah latihan terstruktur Intervals.icu yang bersih (`Warmup`, `Intervals`, `Main Set`, `Cooldown`).
   - Dilarang menyisipkan narasi pembuka atau penutup ke dalam string `description`.

### Step 2: Ekstrak Parameter Tool Call
- `name`: Judul workout (contoh: "Short Sub-Threshold 10x3m").
- `startDate`: Tanggal sesi (format YYYY-MM-DD).
- `startTime`: Jam mulai (format HH:MM, default: "05:30").
- `description`: Teks DSL murni dari template di atas.
- `workoutType`: `"Run"`.

### Step 3: Panggil MCP Tool `create_running_workout`
Panggil tool dan periksa status respons:
- Jika sukses, konfirmasi tanggal, judul, perkiraan durasi, dan target power ke atlet.
