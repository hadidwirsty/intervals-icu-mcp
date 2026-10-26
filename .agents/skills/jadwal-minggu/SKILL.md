---
name: jadwal-minggu
description: Perencanaan jadwal latihan sepekan terpadu — kalkulasi budget jarak 42 hari Faris Salman/Palladino, alokasi pola blok 3-1, pembagian sesi Norwegian Singles, dan penerbitan satu-klik ke kalender Intervals.icu via DSL.
---

# /jadwal-minggu — Perencanaan Jadwal & Anggaran Mingguan Terpadu

Skill ini adalah **pusat komando perencanaan sepekan (*One-Stop Weekly Engine*)**. Menghubungkan rumus anggaran beban ilmiah Coach Faris Salman & Steve Palladino dengan pola periodisasi mikroblok klasik 3-1 dan eksekusi penerbitan jadwal ke kalender Intervals.icu via Teks DSL.

---

## 1. Alur Kerja Perencanaan 4 Tahap

Saat perintah `/jadwal-minggu` dijalankan:

### Tahap 1: Hitung Anggaran Jarak (*Weekly Budgeting*)
1. Panggil `get_activities` untuk 42 hari terakhir dan 90 hari terakhir.
2. Hitung:
   - **Rata-rata Jarak Harian 42 Hari** ($\text{km/hari}$).
   - **Baseline Mingguan**: $\text{Rata-rata 42 Hari} \times 7\text{ hari}$.
   - **Plafon Mingguan Main Aman (+3% s/d +8%)**: $\text{Baseline} \times 1.03\text{ s/d }1.08$.
3. Tentukan Plafon Lari Tunggal Aman:
   - **Plafon Long Run**: Ambil nilai terkecil $\min(3 \times \text{rata-rata 42 hari},\, 1.04 \times \text{LR terjauh 90 hari})$ untuk mencegah *excessive single run*.
   - **Plafon Sesi Workout Harian**: $1.1 - 1.3 \times \text{rata-rata 42 hari}$ (mencakup warmup, repetisi, rest, dan cooldown).
   - **Sisa Budget**: Dialokasikan untuk *Easy Runs* harian dan *Strides* (1–5% durasi).

### Tahap 2: Tentukan Posisi Minggu dalam Siklus 3-1
Tentukan apakah minggu ini berada pada:
- 🔵 **Minggu 1: Baseline (0%)** — Membiasakan tubuh dengan kapasitas baru.
- 🟢 **Minggu 2: Build Pertama (+5%)** — Progresi volume aman.
- 🟢 **Minggu 3: Build Kedua (+5% s/d +8%)** — Akumulasi jika pemulihan prima.
- 🔵 **Minggu 4: Deload (-10% dari Baseline)** — Pemulihan aktif (potong workout 50%, LR -15%).

### Tahap 3: Susun Tata Letak Jadwal Mingguan (5 Hari Lari)
Terapkan **3 Aturan Emas Tata Letak Jadwal Faris Salman**:
1. Long Run dan Workout **JANGAN berturut-turut**.
2. Selalu ada hari **Rest atau Easy setelah Long Run dan Workout**.
3. Jarak dari Long Run ke Workout berikutnya **minimal 2 hari easy/rest** (Workout jatuh di hari ke-3 pasca-LR).
4. **Penjadwalan Strength Training (Bakken & Magness)**: ST dijadwalkan pada **hari yang sama dengan Sub-Threshold (Selasa & Jumat sore)** untuk melindungi hari Easy murni untuk pemulihan (*Keep Hard Days Hard, Easy Days Easy*).

Contoh Tata Letak Jadwal Mingguan Standar:
- **Senin**: Istirahat Total / Mobilitas Ringan (*Rest Day*).
- **Selasa**: Sesi Kualitas Sub-Threshold (Pagi) + Strength Training Penuh 22–25m (Sore).
- **Rabu**: Easy Aerobic Run Santai (Pagi) — Sepatu: Daily Cushion Trainer.
- **Kamis**: Istirahat Total (*Rest Day*).
- **Jumat**: Sesi Kualitas Sub-Threshold Pendek + Strides (Pagi) + Strength Training Penuh 22–25m (Sore).
- **Sabtu**: Easy Shakeout Run Santai (Pagi) — Sepatu: Recovery Cushion / Natural Footwear.
- **Minggu**: Long Aerobic Run Pure Easy (Pagi) — Sepatu: Daily Cushion / Max Cushion.

### Tahap 4: Penerbitan ke Kalender Intervals.icu
Tawarkan draf tabel jadwal kepada atlet. Jika disetujui, panggil MCP tool `create_running_workout` untuk masing-masing hari guna menerbitkan sesi ke kalender atlet dengan Teks DSL resmi.

---

## 2. Parameter Zona Daya & Formula Sesi Lari (% CP)

Gunakan batas nilai resmi berikut saat merancang deskripsi sesi (ekstrak CP aktif via `get_athlete_profile`):
- **Easy Run**: Daya $\le 77\% - 80\%$ CP | HR $\le \text{HR}_{\max} - 50\text{ bpm}$ | RPE 2–3.
- **Long Run**: Daya $\le 75\%$ CP | HR $\le \text{AeT} - 5\text{ bpm}$ | RPE 3.
- **Sub-Threshold (Copeland)**: Daya **$85\% - 95\%$ CP** | HR $< \text{AnT} - 10\text{ bpm}$ | RPE 5–6.
  - *Fast (3–4m / Card A)*: Pace 6:20 – 6:25 /km | Jeda Istirahat: 30–60 detik jalan santai.
  - *Medium (4–6m / Card B)*: Pace 6:25 – 6:30 /km | Jeda Istirahat: 60–90 detik jalan santai.
  - *Long (10–12m / Card C)*: Pace 6:30 – 6:40 /km | Jeda Istirahat: 90–120 detik jalan santai.
- **Strides**: 4–6 repetisi akselerasi 15–20 detik dengan istirahat penuh 45–60 detik.

---

## 3. Format Output Perencanaan (/jadwal-minggu)

Sajikan rancangan jadwal sepekan dalam Bahasa Indonesia dengan format berikut:

```markdown
# 📅 Rancangan Jadwal & Anggaran Latihan Sepekan
**Pekan Ke-**: [Nomor Pekan, misal: Pekan 43 (19–25 Oktober 2026)]
**Fase Latihan**: [Pure Base Building / Build / Taper] | **Siklus Blok**: [M1 Baseline / M2 Build / M3 Build / M4 Deload]

---

### 1. Anggaran Jarak & Beban Mingguan (Faris Salman & Palladino)
- **Baseline 42 Hari Terakhir**: **[XX.X] km/minggu** ([X.X] km/hari)
- **Target Minggu Ini**: **[XX.X] km** ([0% Baseline / +5% Build / -10% Deload])
- **Plafon Long Run Maksimal**: **[XX.X] km** ($\min(\text{Palladino } 3\times,\, \text{Frandsen } 104\%)$)
- **Plafon Sesi Workout Maksimal**: **[X.X] km** ($1.1–1.3\times$ rata-rata harian)
- **Alokasi Easy Runs**: **[XX.X] km** dibagi ke [X] hari santai.

---

### 2. Matriks Rencana Jadwal Harian
| Hari | Menu Latihan & Kategori | Durasi / Jarak | Target Intensitas | Pasangan Sepatu | Catatan Khusus |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Senin** | Istirahat Total (*Rest*) | — | — | — | Pemulihan pasca-Long Run |
| **Selasa** | Sub-Threshold (Card A/B) + ST | [XX mnt] | 85–95% CP (RPE 5–6) | Fast / Plated Trainer | ST Sore: Stabilitas Inti + Kaki |
| **Rabu** | Easy Aerobic Base | [XX mnt] | ≤ 77% CP (HR Santai) | Daily Cushion Trainer | Lolos Talk Test penuh |
| **Kamis** | Istirahat Total (*Rest*) | — | — | — | Jeda pemulihan tengah pekan |
| **Jumat** | Short Sub-T + Strides + ST | [XX mnt] | 85–95% CP + Strides | Fast Trainer / Speed Shoe | ST Sore: Rantai Kinetik + Core |
| **Sabtu** | Easy Recovery / Shakeout | [XX mnt] | ≤ 70% CP (RPE 2) | Max Cushion / Natural | Sangat santai |
| **Minggu**| Long Aerobic Run | [XX mnt] | ≤ 75% CP (Zona Base) | Daily / Max Cushion | Durasi bertahap, no drift |

---

### 3. Distribusi Intensitas (Bakken 3-Zone TID)
- 🟢 **Easy & Long Aerobic (Zone 1)**: **[XX]%** (Target: 70–80%)
- 🟡 **Sub-Threshold (Zone 2)**: **[XX]%** (Target: 20–30%)
- 🔴 **Strides / Neuromuscular (Zone 3)**: **[XX]%** (Target: 1–5%)

---

### 4. Konfirmasi Publikasi ke Kalender
Apakah Anda menyetujui rancangan di atas untuk diterbitkan langsung ke kalender Intervals.icu Anda?  
*(Ketik **"Setuju / Terbitkan"** untuk sinkronisasi otomatis via Teks DSL).*
```
