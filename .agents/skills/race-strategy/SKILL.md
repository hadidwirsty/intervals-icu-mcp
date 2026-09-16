---
name: race-strategy
description: Rancang strategi eksekusi hari perlombaan (Race Day & Fueling Execution Planner) berbasis spesifikasi energi gel (30g carbs), hidrasi iklim tropis hangat/lembab, dan pacing KM-by-KM menuju perlombaan Half Marathon via MCP calculate_race_fueling.
---

# Skill: `/race-strategy` — Race Day & Fueling Execution Planner

Skill ini digunakan untuk merancang **Rencana Eksekusi Hari Perlombaan (Race Day Cheat Sheet)** secara presisi bagi atlet menuju perlombaan jalan raya (khususnya Half Marathon), mengintegrasikan nutrisi energi gel standar (30g karbohidrat), protokol hidrasi iklim tropis hangat/lembab, dan segmentasi pacing KM-by-KM berbasis Critical Power.

---

## 1. Format Prompt Penggunaan

**Rancang strategi lomba Half Marathon utama:**
```text
/race-strategy
```
atau
```text
/race-strategy half_marathon
```

**Rancang strategi dengan parameter kustom:**
```text
/race-strategy dist=21.1 weight=75 temp=26
```

---

## 2. Parameter Fisiologis & Spesifikasi Nutrisi

### A. Parameter Lomba & Profil Atlet
- **Target Race**: Half Marathon (21.0975 km) atau jarak jalan raya terkalibrasi.
- **Kondisi Iklim**: Tropis Hangat/Lembap (Suhu start 24–28°C, Kelembapan Relatif 75–85%).
- **Baseline Daya & Pace**: Dibaca dinamis via MCP (`get_athlete_profile` dan `get_activity_details`).

### B. Spesifikasi Nutrisi Energi Gel Standar (Contoh: EJ Sport)
Sesuai data resmi [ejsportofficial.com](https://ejsportofficial.com/):
- **Kandungan Utama**: 12g Maltodextrin + 18g Dextrose = **30 gram karbohidrat per sachet**.
- **Formula Dual-Carb**: Rasio Maltodextrin:Dextrose mempercepat *gastric emptying* dan penyerapan via transporter usus SGLT1 tanpa risiko gangguan lambung (*GI distress*).
- **Zat Aktif**: 100 mg L-Carnitine, Vitamin B Complex (B3 15mg, B6 1.2mg, B5 5mg).

---

## 3. Langkah Eksekusi Sistem

Saat dipanggil, jalankan langkah-langkah berurutan berikut:

### Step 1: Ambil Data Atlet & Prediksi Waktu
1. Panggil MCP tool `get_athlete_profile` untuk mendapatkan `ftp` (CP) dan `lthr`.
2. Panggil MCP tool `predict_race_time` dengan input VDOT atlet dan jarak target untuk mendapatkan estimasi waktu finish.

### Step 2: Hitung Rencana Nutrisi via MCP Tool `calculate_race_fueling`
Panggil MCP tool `calculate_race_fueling` dengan parameter:
- `raceDistanceKm`: Jarak lomba (default: 21.0975)
- `athleteWeightKg`: Berat badan atlet
- `criticalPowerWatts`: Critical Power (CP)
- `temperatureCelsius`: Suhu rata-rata (default: 26°C)
- `relativeHumidityPct`: Kelembapan relatif (default: 80%)
- `vdot`: Skor VDOT atlet

### Step 3: Sajikan Laporan "Race Day Strategy Cheat Sheet"
Format laporan visual komprehensif yang siap disimpan di smartphone atlet:

```markdown
# 🏁 Race Day Strategy Cheat Sheet: [Nama Perlombaan / Target Race]
**Target Jarak**: [Jarak] km | **Estimasi Waktu Finish**: [Waktu Finish] | **Critical Power**: [CP] W

---

## ⚡ 1. Protokol Nutrisi Energi Gel (4 Sachet / 120g Carbs Total)
*Kandungan per sachet: 30g Karbohidrat (12g Maltodextrin + 18g Dextrose), 100mg L-Carnitine, Vitamin B Complex.*

| Waktu / KM | Tindakan Nutrisi | Asupan Karbohidrat | Pendamping Cairan | Catatan Taktis |
|---|---|:---:|---|---|
| **T-15 Menit** | 1 Sachet Gel | 30 gram | 150 ml air mineral | Di garis start. Mengisi glikogen awal tanpa lonjakan insulin prematur. |
| **KM 6 (~38m)** | 1 Sachet Gel | 30 gram | 120–150 ml air | Water Station KM 6–7. Dorong dengan air putih untuk penyerapan usus optimal. |
| **KM 12 (~78m)**| 1 Sachet Gel | 30 gram | 120–150 ml air/isotonik | Water Station KM 12–13. Titik krusial pertengahan rute mencegah deplesi glikogen. |
| **KM 17 (~108m)**| 1 Sachet Gel | 30 gram | 100 ml air mineral | Water Station KM 17–18. Booster energi untuk dorongan akhir 4 km penutup. |

> **Rata-rata Asupan**: ~45–50 gram karbohidrat per jam (ideal untuk Half Marathon).

---

## 💧 2. Protokol Hidrasi & Termoregulasi Tropis
- **Kondisi Iklim**: Suhu 25–28°C, RH 75–85% (*High Thermal Stress*).
- **Estimasi Sweat Rate**: Sesuai bobot atlet (~800–1000 ml/jam).
- **Target Minum Aman**: **500–700 ml/jam** (minum teratur 100–150 ml di SETIAP water station tiap 2.5–3 km, jangan menumpuk).
- **Target Elektrolit**: 350–500 mg Sodium/jam (selingi air putih dengan isotonik).
- **Manajemen Suhu Inti [Sumber: NSA §4.2]**:
  - Ambil spons dingin atau siram air ke kepala dan tengkuk di water station untuk menekan *cardiac drift* akibat stres termal.
  - Jika denyut jantung (HR) melompat tinggi akibat panas terik, prioritaskan rujukan ke **RPE (5–6/10)** dan target daya Watt, jangan panik.

---

## 🎯 3. Strategi Pacing Taktis KM-by-KM

| Segmen | Target Pace | Target Power | % CP | Fokus & Instruksi Taktis |
|---|:---:|:---:|:---:|---|
| **KM 1 – 3**<br/>*Calm Adrenaline Guard* | Sedikit lebih lambat dari target pace | 87–90% CP | < 90% | Tahan nafsu. Jangan terbawa euforia kerumunan di garis start. Biarkan jantung naik bertahap. |
| **KM 4 – 17**<br/>*Sub-T Cruise Control* | Target Pace Half Marathon | 92–94% CP | 92–94% | Zona kerja utama Sub-Threshold. Kadens stabil ≥ 175 rpm untuk efisiensi mekanis dan peredaman impak sendi. Ambil air di tiap WS. |
| **KM 18 – 21.1**<br/>*Empty the Tank Finish* | Progresif kencang | 94–97% CP | 94–97% | Buka langkah progresif, maksimalkan sisa energi dan dorongan sepatu balap hingga garis finish! |

---

## 🧊 4. Protokol Pasca-Finish
1. **Rehidrasi Cepat**: Minum 500–750 ml air berisotonik dalam 30 menit pertama.
2. **Restorasi Glikogen**: Konsumsi karbohidrat + protein (rasio 4:1) dalam 45 menit pertama.
3. **Relaksasi & Pendinginan**: Lakukan peregangan mobilitas ringan dan jalan santai untuk melancarkan sirkulasi asam laktat.
```
