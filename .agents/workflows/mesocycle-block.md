---
description: Kalkulator alokasi 5 minggu mesosiklus dengan model Double Build (W1 Baseline → W2-3 Build → W4 Deload -10% → W5 New Baseline). Merencanakan alokasi beban per tipe sesi menggunakan CTL Multiplier System (Palladino Power Project / Coach Faris Salman).
---

# Workflow: `/mesocycle-block`

Workflow ini digunakan untuk merencanakan alokasi beban (*load*) atau jarak (*distance/km*) selama **1 Blok Mesosiklus (5 Minggu)** menggunakan **Blok 5 Minggu (Double Build)** sesuai metodologi Coach Faris Salman, dengan distribusi beban per sesi berbasis **CTL Multiplier System dari Palladino Power Project**.

---

## Format Prompt Penggunaan

**Budget Berbasis Load (TSS / Time):**
```text
/mesocycle-block load
```

**Budget Berbasis Jarak (Kilometer / Distance):**
```text
/mesocycle-block distance
```

---

## Langkah Eksekusi Sistem

### Step 1: Ambil Data Baseline dari MCP Intervals.icu
1. **`get_fitness_chart`** (42 hari terakhir):
   - `cols`: `ctl,atl,tsb,rampRate`
   - Ambil nilai **CTL terkini** sebagai referensi `Baseline (W1)`.
   - Ambil nilai **30-day Max TSS** dari historical data untuk Single Run Safeguard.
2. Jika `mode = "distance"`: Hitung **42-day Average Daily km** dari data aktivitas.

---

### Step 2: Kalkulasi Formula Blok 5 Minggu (Coach Salman)

Hitung alokasi 5 minggu berdasarkan **CTL Baseline** atau **42-day Avg km**:

| Minggu | Fase | Formula Load | Modifier |
|---|---|---|---|
| **W1 — Baseline** | Referensi Awal | `Budget = CTL × 7` (atau Avg km × 7) | `0%` |
| **W2 — Build** | Progressive Build | `W1 Budget × 1.05` | `+5%` dari W1 |
| **W3 — Build** | Progressive Build | `W2 Budget × 1.05` | `+5%` dari W2 (~`+10%` dari W1) |
| **W4 — Deload** | *Unloading Week* | `W1 Budget × 0.90` | **`−10% dari W1 (Baseline)`** |
| **W5 — New Baseline** | Referensi Baru | `W1 Budget × 1.03` | `+3%` dari W1 |

> [!WARNING]
> **Deload W4 = -10% dari Baseline (W1)**, bukan -25% dari Peak (W3).
> Ini menjaga *neuromuscular tone* dan *aerobic stimulus* tetap aktif selama minggu recovery.

> [!TIP]
> Target **Ramp Rate Sweetspot**: `+1 s.d. +3 TSS/minggu`. Jika kenaikan W1→W3 melebihi +5 TSS/minggu, pertimbangkan memperlambat laju build.

---

### Step 3: Distribusi Beban per Tipe Sesi (CTL Multiplier)

Untuk Setiap Minggu (W1–W5), distribusikan budget menggunakan **CTL Multiplier System**:

| Tipe Sesi | Range % CTL | Target Beban | Batasan |
|---|---|---|---|
| **Easy / Recovery Run** | `70–90% CTL` | `0.7×CTL – 0.9×CTL` per sesi | Cap ≤ 60 menit, ≤ 80% CP |
| **Moderate Aerobic Run** | `100–150% CTL` | `1.0×CTL – 1.5×CTL` per sesi | Mid-week aerobic |
| **Interval / Tempo Session** *(inc. W/U & C/D)* | `125–175% CTL` | `1.25×CTL – 1.75×CTL` per sesi | Sesi kualitas |
| **Long Run** | `150–200% CTL` *(HM)* | `1.5×CTL – 2.0×CTL` per sesi | Untuk Half Marathon prep |

> [!IMPORTANT]
> **Single Run Safeguard**: Sebelum menetapkan target sesi Long Run, verifikasi bahwa TSS rencana ≤ 114% dari 30-Day Max TSS historis. Jika ≥ 115% → High Risk, kurangi durasi/intensitas.

---

### Step 4: Generate Mesocycle Block Report

```markdown
### 📊 Matriks Perencanaan Mesosiklus 5 Minggu (Double Build — Coach Salman)

**Mode Budget**: [Load (TSS) / Distance (km)]
**Baseline CTL (42d Avg)**: [Value] load/hari
**30-Day Max TSS (Safeguard Reference)**: [Max TSS] load

| Minggu | Fase | Total Budget | Perubahan vs W1 | Catatan & Fokus |
|---|---|---|---|---|
| **W1** | Baseline | [W1 Budget] | `0%` (referensi) | Stabilisasi ritme latihan |
| **W2** | Build | [W2 Budget] | `+5%` | Kenaikan durasi Quality/LR |
| **W3** | Build | [W3 Budget] | `+10%` | Beban puncak blok, monitor fatigue |
| **W4** | **Planned Deload** | **[W4 Budget]** | **`−10% dari W1`** | **Recovery & Supercompensation trigger** |
| **W5** | New Baseline | [W5 Budget] | `+3%` | Titik awal blok berikutnya |

---

### 📐 Target Beban per Tipe Sesi (Berbasis CTL Terkini: [CTL] load/hari)

| Tipe Sesi | Target Beban (load) | Setara Durasi (estimasi) |
|---|---|---|
| Easy / Recovery Run | [0.7×CTL] – [0.9×CTL] | ≤ 60 menit |
| Moderate Aerobic Run | [1.0×CTL] – [1.5×CTL] | 60–80 menit |
| Interval / Tempo Session | [1.25×CTL] – [1.75×CTL] | 50–80 menit (inc. W/U & C/D) |
| Long Run (HM Prep) | [1.5×CTL] – [2.0×CTL] | 90–140 menit |

---

💡 **Instruksi Coach untuk Deload Week (W4)**:
- Jaga durasi Easy Run tetap di cap 60 menit (tidak perlu dipotong lebih pendek dari biasanya).
- Ganti sesi Subthreshold keras dengan Moderate Aerobic atau Easy + Strides.
- Long Run dipotong ke batas bawah range (target ~1.5× CTL, bukan 2.0×).
- Jangan tambah jarak/durasi ekstra meski merasa sangat segar — **ego management is key!**
```
