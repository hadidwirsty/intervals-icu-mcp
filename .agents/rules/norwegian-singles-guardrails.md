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
- **Rasio Durasi 75/25 & Evolusi Proporsi [Sumber: NSA §2.4, Copeland 2026]**:
  - Sub-Threshold (< LT2): Sekitar 20–25% dari total durasi mingguan. Pada volume tinggi, proporsi ini secara alami bergeser ke arah **20–22%** (dilarang memaksakan 25% jika beban total sudah besar).
  - Easy Run & Long Run: Minimal 75–80% dari total durasi mingguan (< 70% HRmax).
- **Formula Long Run Copeland [Sumber: NSA §4.6]**:
  - Panduan awal durasi Long Run santai adalah **~1.7 kali durasi Easy Run harian biasa** (contoh: Easy 45 menit $\rightarrow$ Long Run ~75–80 menit; pada volume tinggi mencapai 95–105 menit).
- **Pilar Durasi Sub-T & Istirahat Interval [Sumber: NSA §2.2, Copeland 2026]**:
  - 3 format repetisi utama Copeland: **~3 menit** (12–15k pace, r:60s), **~6 menit** (20k/HM pace, r:60–90s), **~10 menit** (25–30k pace, r:90–120s). Repetisi cepat 1 menit di 10k pace bukan bagian menu baku default framework.
  - Istirahat berupa berdiri, jalan santai, atau slow jogging.
  - **Dilarang memperpendek jeda istirahat atau jogging lebih cepat sebagai target progresi**.
- **Aturan Progresi 5 Langkah Copeland ("The Plans" §2.4)**:
  1. *Start from recent training*: Berangkat dari volume stabil yang sudah rutin dijalani.
  2. *Consolidate before increasing*: Tahan beban baru minimal **1 bulan** pada level yang bisa dikelola, lalu kenaikan kecil berikutnya ditahan 2–3 minggu.
  3. *Add time gradually*: Menambah 1 repetisi 3 menit Sub-T wajib dipasangkan dengan menambah **~12 menit Easy Run santai** agar rasio tetap seimbang.
  4. *Let proportions evolve*: Pada volume tinggi porsi Sub-T dapat bergeser ke 20–22%.
  5. *Earn faster paces*: Target diperbarui dari race/TT (tiap 4–8 minggu), bukan otomatis naik tiap minggu.
- **Critical Power (CP) Caution [Sumber: NSA §4.10]**:
  - CP adalah estimasi model, bukan nilai pasti LT2 atau pembacaan laktat langsung. Jangan berasumsi 1 persentase %CP cocok untuk semua atlet/format repetisi. Selalu validasi dengan RPE (*comfortably hard* 5–6/10) dan keterulangan (*repeatability*).
- **Strides & Strength Work [Sumber: NSA §4.7]**:
  - Tambahan opsional yang harus diperhitungkan beban kelelahannya. Latihan kekuatan fungsional & stabilitas spinal (McGill Big 3 via `/strength-guide`) disarankan 2x/minggu pada hari Quality.
- **Konsistensi Sepanjang Tahun**: Pola berkesinambungan (pola 6 hari latihan, 4 hari 2-Q, atau full routine 7 hari) dengan pemetaan resmi **Session Cards (Intro: 4x 3m, Card A: 3m, Card B: 6m, Card C: 9–12m)**.
- **Aturan Progresi**: *"Change one thing at a time"* — jangan menaikkan volume dan intensitas sekaligus.
- **Aturan Perlombaan**: *"A race replaces a workout"* — race/TT menggantikan 1 sesi kualitas mingguan, bukan ditambah di luar jadwal.
- **Prioritas Sinyal Tubuh**: *"A good dashboard disagrees with how you feel"* — selalu dahulukan sinyal kelelahan fisik tubuh dibanding angka dashboard jam tangan.

## 2. Batas Fisiologis & Safeguards Atlet (Konfigurasi Generic)
- **Sumber Data Dinamis**: Nilai CP/FTP, LTHR, Max HR, dan RHR diekstrak secara dinamis via MCP `get_athlete_profile` dan `get_wellness_data`.
- **Max HR Aktual**: Selalu utamakan Max HR terukur aktual dari data aktivitas/profil atlet dibanding rumus estimasi populasi (misal rumus Tanaka) jika data aktual tersedia.
- **Plafon Easy Run Tropis / Cuaca Panas**: Pada iklim tropis hangat/lembab (suhu 24–28°C, RH > 75%), cardiac drift wajar menaikkan denyut jantung (+10–15 bpm). Jika Power tetap berada di zona aerobik santai ($\le 77\%$ CP), sesi tetap dinyatakan patuh (OK Tropical/Heat Adjusted).
- **Biomekanika & Disiplin Easy Run**: Dilarang memaksakan pace kencang di hari santai (Easy Run) guna mencegah kelelahan glikogen kronis dan risiko impak sendi berlebih.
- **Protokol Penguatan & Stabilitas Inti**: Latihan penguatan stabilitas spinal inti (misal: core stability / McGill Big 3) direkomendasikan 1–2x/minggu setelah sesi latihan untuk menjaga postur tanpa kompresi spinal berlebih.
