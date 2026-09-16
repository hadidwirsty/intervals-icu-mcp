# Norwegian Singles Training Guardrails

Rule ini berlaku universal untuk seluruh interaksi AI Coach, pembuatan workout, analisis beban latihan, dan perencanaan kalender di workspace `intervals-icu-mcp`.

## 1. Prinsip Mutlak Metodologi
- **Metodologi Tunggal**: Hanya gunakan metodologi **Norwegian Singles Training Method** (`norwegiansingles.run`).
- **DILARANG** menggunakan atau menyarankan:
  - Periodisasi blok kaku (seperti blok 5-minggu: 3 build + 1 deload + 1 test).
  - Formula *CTL Multipliers* Palladino Power Project (`0.7–0.9x`, `1.25–1.75x`).
  - Latihan interval di atas ambang laktat 2 (LT2 / > 95% CP / VO₂max / Anaerobic Repeats) dalam rutinitas mingguan normal.
  - Formula pembatasan jarak Frandsen.
- **Ukuran Volume**: Selalu hitung dan evaluasi volume dalam **Durasi Waktu (jam/minggu)**, bukan jarak (km).
- **Rasio Durasi 75/25**:
  - Sub-Threshold (< LT2): Maksimal 20–25% dari total durasi mingguan.
  - Easy Run & Long Run: Minimal 75–80% dari total durasi mingguan (< 70% HRmax).
- **Istirahat Interval**: Wajib **istirahat pasif singkat (30–60 detik jalan/berdiri)**.
- **Konsistensi Sepanjang Tahun**: Pola mingguan berkesinambungan `E-Q-E-Q-E-Q-LR` (atau variasi 2-Q).

## 2. Batas Fisiologis & Safeguards Atlet (Konfigurasi Generic)
- **Sumber Data Dinamis**: Nilai CP/FTP, LTHR, Max HR, dan RHR diekstrak secara dinamis via MCP `get_athlete_profile` dan `get_wellness_data`.
- **Max HR Aktual**: Selalu utamakan Max HR terukur aktual dari data aktivitas/profil atlet dibanding rumus estimasi populasi (misal rumus Tanaka) jika data aktual tersedia.
- **Plafon Easy Run Tropis / Cuaca Panas**: Pada iklim tropis hangat/lembab (suhu 24–28°C, RH > 75%), cardiac drift wajar menaikkan denyut jantung (+10–15 bpm). Jika Power tetap berada di zona aerobik santai ($\le 77\%$ CP), sesi tetap dinyatakan patuh (OK Tropical/Heat Adjusted).
- **Biomekanika & Disiplin Easy Run**: Dilarang memaksakan pace kencang di hari santai (Easy Run) guna mencegah kelelahan glikogen kronis dan risiko impak sendi berlebih.
- **Protokol Penguatan & Stabilitas Inti**: Latihan penguatan stabilitas spinal inti (misal: core stability / McGill Big 3) direkomendasikan 1–2x/minggu setelah sesi latihan untuk menjaga postur tanpa kompresi spinal berlebih.
