---
name: predict-race
description: Kalkulator estimasi waktu finish race (5K, 10K, Half Marathon, Full Marathon) dan generator jadwal tapering 10–14 hari berbasis VDOT, CTL, & TSB via MCP predict_race_time & calculate_taper_plan. Catatan: struktur tapering di sini adalah konvensi umum endurance tapering, belum terverifikasi sebagai bagian resmi Norwegian Singles Method.
---

# Skill: `/predict-race` — Race Predictor & Tapering Planner

Skill ini digunakan untuk memproyeksikan estimasi waktu finish race, target pace rata-rata, dan menyusun rencana tapering penurunan volume 10–14 hari menggunakan MCP tool `predict_race_time` dan `calculate_taper_plan`.

> **Catatan sumber (penting)**: bagian *Race Predictor* (VDOT, CTL, TSB sebagai faktor koreksi) sejalan dengan prinsip umum NSA (CTL sebagai fitness berkelanjutan — Sumber: NSA §3). Seluruh bagian situs norwegiansingles.run (§1–7) telah diverifikasi langsung: dokumen resmi tidak memuat formula numerik persentase pemotongan tapering (75%/50%), melainkan hanya menyebutkan konsep umum *Note on Peaking* (§5.8) sebagai fase terpisah di atas fondasi Sub-T. Angka-angka persentase tapering di bawah ini mengikuti konvensi umum tapering endurance (reduksi volume 30–50% dalam 2–3 minggu terakhir, mempertahankan frekuensi & intensitas) yang berlaku luas di luar NSA. Perlakukan skema tapering di bawah sebagai pendekatan personal yang rasional, bukan kutipan resmi NSA.

---

## 1. [Sumber: NSA §2.4, §4.3] Kalibrasi Berkala & Ritme Race / Time Trial (TT)

- **Anjuran Race / TT Reguler (Tiap 4–8 Minggu)**: NSA secara aktif menganjurkan partisipasi dalam perlombaan (*race*, misal 5K/parkrun) atau melakukan *time trial* (TT 3K–5K) teratur tiap 4–8 minggu.
  * Fungsi 1: Menjadi benchmark riil untuk memperbarui VDOT dan zona pace/HR latihan.
  * Fungsi 2: Memberikan stimulasi neuromuskular kecepatan tinggi dan memecah plateau latihan.
  * Fungsi 3: Melatih toleransi mental terhadap usaha balap (*"remembering how to hurt"*).
- **Reminder Kalibrasi >8 Minggu**: Jika tanggal kalibrasi VDOT atau threshold pace terakhir sudah melewati **8 minggu**, sistem wajib menyarankan sesi Time Trial baru via `/calc-vdot` sebelum menetapkan target race berikutnya.
- **Fenomena "Racing Rust"**: Wajar bila race/TT pertama setelah blok panjang latihan Sub-T terasa agak kaku/lamban (*racing rust*). Ini adalah fase adaptasi saraf terhadap intensitas supra-LT2, **bukan kemunduran performa**.

---

## 2. [Sumber: NSA §5.1] Catatan Reassurance Target Half Marathon (HM)

- **5K s.d. Half Marathon adalah "Sweet Spot" NSA**: Dokumentasi resmi (§5.1) menegaskan bahwa rentang jarak 5K hingga Half Marathon adalah area di mana metode Norwegian Singles bekerja paling efektif bagi pelari rekreasional/hobby jogger.
- **Tidak Memerlukan Adaptasi Maraton**: Target Half Marathon **TIDAK memerlukan** adaptasi berat ala maraton (§5.4) seperti memperpanjang Long Run hingga 2–3 jam atau menyisipkan blok tempo/Sub-T di dalam Long Run.
- **Cukup Long Run Aerobik 75–90 Menit**: Pendekatan baku—Long Run 75–90 menit pada intensitas *pure easy* (< 70% HRmax) tanpa tempo rehearsal—sudah terbukti memadai dan optimal untuk target Half Marathon.

---

## 3. Input Kebutuhan

Mintalah informasi berikut dari atlet (jika belum tersedia):
- **Jarak Race**: `5k`, `10k`, `half_marathon` (21.1 km), `full_marathon` (42.2 km), atau jarak kustom (km).
- **Nilai VDOT**: Hasil tes VDOT atau estimasi dari kalkulator `/calc-vdot`.
- **Target Tanggal Race**: Tanggal pelaksanaan lomba (format YYYY-MM-DD).

---

## 4. Langkah Pengambilan & Kalkulasi Data via MCP

1. **Penentuan Nilai VDOT**:
   - Panggil MCP Tool `calculate_vdot` dengan argumen `{ raceTime: "MM:SS" / "HH:MM:SS", distanceKm: X }` atau gunakan VDOT aktif profil atlet.
2. **`get_fitness_chart`**:
   - Ambil nilai `ctl` (kebugaran kronis 42 hari) dan `tsb` (kesiapan/form) terkini.
3. **`predict_race_time`**:
   - Input: `{ vdot, targetDistanceKm, ctl, tsb }`
   - Dapatkan: `predictedTimeFormatted`, `predictedPaceFormatted`, `ctlAdjustmentFactor`, dan `tsbAdjustmentFactor`.
4. **`calculate_taper_plan`**:
   - Input: `{ raceDate, currentCtl: ctl, currentTsb: tsb, taperWeeks: 2, racePriority: "A" }`
   - **Prinsip Tapering (konvensi umum, lihat catatan sumber di atas — bukan dikonfirmasi dari NSA)**:
     - **Kurangi volume, pertahankan frekuensi**: Frekuensi lari mingguan tetap sama (misal 5–6x/minggu), namun volume total mingguan dipotong ke 75% di Minggu Taper 1, dan 50% di Minggu Race Week.
     - **Potong durasi kerja Sub-T**: Pangkas repetisi/durasi interval kualitas sebesar ~50% (contoh: dari 10x 3m menjadi 5x 3m, atau 6x 5m menjadi 3x 5m) dengan kecepatan/watt yang sama guna menjaga ketajaman neuromuskular tanpa menimbulkan kelelahan.
     - **Target Form (TSB)**: Mencapai `+8 s.d. +15` di hari perlombaan (*Peak Freshness*) — angka ini dari lapisan TSB non-NSA, lihat skill `training-load-analysis` Bagian B.

---

## 5. Format Respons Laporan Prediksi & Tapering

```markdown
### 🏆 Race Prediction & Tapering Plan Report

**Target Perlombaan**: [Jarak Race] km | **Tanggal Lomba**: [Tanggal]  
**VDOT Active**: [VDOT] | **Kebugaran (CTL)**: [ctl] | **Kesiapan (TSB)**: [tsb]

---

#### 1. Prediksi Performa & Target Pace
- **Estimasi Waktu Finish**: [predictedTimeFormatted]
- **Target Pace Rata-rata**: [predictedPaceFormatted] min/km
- **Faktor Koreksi Kebugaran (CTL)**: [ctlAdjustmentFactor]
- **Faktor Koreksi Kesiapan (TSB)**: [tsbAdjustmentFactor]
- **Reassurance Target HM [Sumber: NSA §5.1]**: Jarak 5K–HM adalah *sweet spot* utama NSA. Long Run 75–90 menit santai sudah memadai tanpa perlu simulasi tempo-in-LR ala maraton.

---

#### 2. Jadwal Tapering (10–14 Hari, konvensi umum — lihat catatan sumber)
| Fase Tapering | Target Volume | Target TSB | Panduan Eksekusi |
|---|:---:|:---:|---|
| **Minggu Taper 1 (H-14 s.d. H-8)** | ~70–75% | +0 s.d. +5 | Frekuensi lari tetap sama. Potong repetisi Sub-T 30–40% (misal 6x 5m jadi 4x 5m). Long Run dipotong ke 60–70 menit. |
| **Race Week (H-7 s.d. Hari H)** | ~50% | **+8 s.d. +15** | Hanya easy run pendek (20–30 menit) + 1 sesi aktivasi ringan (3–4x 200m race pace feel). Istirahat penuh 1–2 hari sebelum race. |

---

#### 3. Panduan Taktis Eksekusi Race Day
- **Pacing**: Jaga pacing merata (*even pacing*) atau *slight negative split*. Jangan terbawa adrenalin di 3 km pertama.
- **Batas Daya / Heart Rate**: Pertahankan power di kisaran target dan pastikan tidak menembus batas laktat terlalu dini.
- **Hidrasi & Fueling**: Lakukan strategi asupan cairan dan karbohidrat yang telah diuji saat sesi Long Run.
- **Catatan Kalibrasi [Sumber: NSA §2.4, §4.3]**: Pastikan VDOT berasal dari race/TT dalam 4–8 minggu terakhir. Jika baru menyelesaikan blok Sub-T panjang, wajar jika rasa awal agak kaku (*racing rust*).
- **Rencana Eksekusi Menyeluruh**: Jalankan command `/race-strategy` untuk kalkulasi mendalam strategi split pacing berbasis Critical Power (CP), jadwal intake gel EJ Sport (30g carb), serta manajemen hidrasi dan batas cairan aman di iklim tropis.
```