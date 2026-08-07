# Running Coach AI — Panduan Konfigurasi

Folder `.agents/` berisi template **Antigravity Agent** (skill & workflow) untuk membangun Running Coach AI personal yang mengambil data langsung dari Intervals.icu via MCP.

---

## Cara Menggunakannya

### 1. Konfigurasi SKILL.md

Buka file [`skills/running-coach-analysis/SKILL.md`](skills/running-coach-analysis/SKILL.md) dan isi placeholder berikut dengan data Anda:

**Bagian 2 — Profil Atlet:**
```
- Nama Atlet: [Nama Anda]
- Usia: [Usia]
- Perangkat: [Nama perangkat GPS + power meter Anda]
- Status Kompetisi: [Target race atau status Anda]
- Filosofi Latihan: [Deskripsi pendekatan latihan Anda]
```

**Bagian 3 — Power Zones & HR Zones:**
Sesuaikan rentang zona dengan setting Intervals.icu Anda. Parameter utama (CP, W', LTHR, Max HR, dll) akan dibaca **otomatis dari data Intervals.icu** saat workflow berjalan.

**Bagian 4 — Blueprint Workout:**
Masukkan semua tipe sesi yang ada dalam program latihan Anda (nama sesi, target power, target HR, durasi).

### 2. Sambungkan ke Project Antigravity

Pastikan Anda membuka percakapan Antigravity dengan **workspace** yang mengarah ke folder project ini. Dengan begitu:
- Skill `running-coach-analysis` akan otomatis terbaca.
- Slash-command `/run-report` akan tersedia di chat.

### 3. Jalankan Laporan Pasca-Sesi

Ketik di chat Antigravity:

```
/run-report

- Hari/Tanggal: Kamis, 6 Agustus 2026
- Sesi Eksekusi: [Nama Sesi] - [Durasi] menit
- RPE (Rating of Perceived Exertion): [X]/10
- Catatan Fisik: [Catatan subjektif Anda]
```

Antigravity akan otomatis:
1. Ambil data aktivitas dari Intervals.icu via MCP
2. Ekstrak profil fisiologis terkini Anda
3. Analisis decoupling, cardiac drift, efisiensi per interval
4. Hasilkan coaching report 4-bagian + rekomendasi sesi berikutnya

---

## Apa yang Dibutuhkan

- [Antigravity](https://antigravity.dev) dengan MCP `intervals-icu` terkonfigurasi
- Intervals.icu account dengan data aktivitas Power (running power meter)
- API Key dari Intervals.icu (Settings → Developer Settings)
