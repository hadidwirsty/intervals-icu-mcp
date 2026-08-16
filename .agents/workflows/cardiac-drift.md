---
description: Analisis Aerobic Decoupling & Cardiac Drift dari stream telemetri (HR vs Power/Speed) paruh 1 vs paruh 2 via MCP analyze_cardiac_drift.
---

# Cardiac Drift & Aerobic Decoupling Workflow

Workflow ini digunakan untuk menganalisis efisiensi aerobik (*Efficiency Factor*) dan penurunan performa kardiovaskular (*Cardiac Drift*) dari sesi latihan lari atau sepeda.

---

## 1. Langkah Pengambilan Data via MCP

1. Panggil MCP Tool `get_activities` untuk menemukan ID aktivitas lari/sepeda terkini.
2. Panggil MCP Tool `get_activity_streams` dengan parameter `keys: ["heartrate", "watts", "velocity_smooth"]`.
3. **Penentuan Stream Beban (Power vs Speed)**:
   - **Mode Power (Default)**: Jika stream `watts` tersedia dan memiliki data (>0), gunakan array `watts` sebagai `powerOrSpeedStream` (satuan EF: `Watt/bpm`).
   - **Mode Pace / Speed (Fallback)**: Jika atlet lari tanpa sensor daya / power meter (`watts` kosong atau bernilai nol), gunakan array `velocity_smooth` sebagai `powerOrSpeedStream` (satuan EF: `(m/s)/bpm`).
4. Panggil MCP Tool **`analyze_cardiac_drift`**:
   - Argument: `{ heartrateStream, powerOrSpeedStream }`
   - Dapatkan: `efHalf1`, `efHalf2`, `decouplingPct`, `status`, dan `advice`.

---

## 2. Format Respons Laporan Cardiac Drift

```markdown
### ⚡ Aerobic Decoupling & Cardiac Drift Report

**Status Decoupling**: [status] | **Decoupling Rate**: [decouplingPct]%

#### 1. Metrik Efisiensi Aerobik (EF)
- **Efficiency Factor Paruh 1 (H1)**: [efHalf1]
- **Efficiency Factor Paruh 2 (H2)**: [efHalf2]
- **Perubahan Efisiensi**: [decouplingPct]%

#### 2. Evaluasi & Panduan Fisiologis
- **Klasifikasi**: [status] ([advice])
- **Rekomendasi**:
  * If `< 3.0%`: Aerobic engine sangat solid & efisien. Lanjutkan progresivitas volume.
  * If `3.0% - 5.0%`: Normal & terkendali. Pertahankan strategi nutrisi & hidrasi.
  * If `> 5.0%`: Cardiac drift tinggi. Evaluasi hidrasi, suhu lingkungan, atau kurangi durasi Long Run berikutnya.
```
