---
name: mesocycle-block
description: Kalkulator alokasi 5 minggu mesosiklus dengan model Double Build (W1 Baseline → W2-3 Build → W4 Deload -10% → W5 New Baseline). Merencanakan alokasi beban per tipe sesi menggunakan CTL Multiplier System (Palladino Power Project / Coach Faris Salman).
---

# Skill: `/mesocycle-block`

Skill ini digunakan untuk merencanakan alokasi beban (*load*) atau jarak (*distance/km*) selama **1 Blok Mesosiklus (5 Minggu)** menggunakan **Blok 5 Minggu (Double Build)** sesuai metodologi Coach Faris Salman, dengan distribusi beban per sesi berbasis **CTL Multiplier System dari Palladino Power Project**.

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
2. Jika `mode = "distance"`: 
   - Hitung **42-day Average Daily km** dari data aktivitas (Baseline = 42d avg km × 7).
   - Ambil **90-day Max Long Run km** dari riwayat aktivitas untuk batas Frandsen et al. 2025.

---

### Step 2: Kalkulasi Formula Blok 4–5 Minggu (Coach Faris Salman)

Hitung alokasi blok adaptasi berdasarkan **CTL Baseline** atau **42-day Avg km**:

| Minggu | Fase | Formula Load / Jarak | Modifier vs W1 Baseline | Keterangan & Aturan Adaptasi |
|---|---|---|:---:|---|
| **W1** | **Baseline** | `Budget = CTL × 7` (atau Avg km × 7) | `0%` | Membiasakan tubuh dengan load tanpa menambah beban |
| **W2** | **Build 1** | `W1 Budget × 1.05` | **`+5%`** | Build pertama di zona aman (🟢) |
| **W3** | **Build 2** | `W1 Budget × 1.08` *(Opsi A)*<br>`W1 Budget × 1.05` *(Opsi B)* | **`+8%`** *(Opsi A)*<br>**`+5%`** *(Opsi B)* | **Percabangan Kondisional!**<br>🟢 **Opsi A (+8%)**: Jika recovery W2 optimal.<br>🟡 **Opsi B (+5%)**: Jika recovery kurang (RHR naik / kaki berat / tidur terganggu) |
| **W4** | **Planned Deload** | `W1 Budget × 0.90` | **`−10%`** | **Unloading Week**: Restorasi otot & pemicu superkompensasi |
| **W5** | **Baseline Baru** | `Budget Baru = 42d Avg Baru × 7` | Referensi Baru | Hitung ulang 42d avg km & 90d max LR pasca deload W4 |

> [!WARNING]
> **Deload W4 = -10% dari Baseline (W1)**, bukan -25% dari Peak (W3).
> **Protokol Taktis Deload W4 (Coach Faris Salman)**:
> - **Long Run**: **Scale down ~15%** (cth: 21 km $\rightarrow$ 17–18 km, atau beban target batas bawah ~1.5× CTL).
> - **Workout / Interval**: **Wajib potong setengahnya (50% / ~5–6 km) atau di-SKIP sama sekali!**
> - **Easy Run**: Isi sisa budget dengan santai (RPE 1–2).
> - Jaga durasi Easy Run tetap di cap normal (tidak perlu dipotong lebih pendek).

> [!TIP]
> **Tanda Recovery Kurang di W2 (Kriteria Opsi B di W3)**:
> 1. RHR pagi lebih tinggi dari biasanya (> 3–5 bpm).
> 2. Easy run sulit terasa 'Easy', kaki terasa berat di pace santai.
> 3. Kualitas tidur terganggu.
> *Prinsip Coach Faris*: Kalau ragu, tetap di +5% atau turunkan ke 0%. Naik pelan-pelan tidak bikin rugi, yang penting minggu depan bisa lari lagi!

---

### Step 3: Distribusi Beban per Tipe Sesi

#### A. Mode Load (CTL Multiplier System)
Untuk Setiap Minggu (W1–W5), distribusikan budget menggunakan **CTL Multiplier System**:

| Tipe Sesi | Range % CTL | Target Beban | Batasan |
|---|---|---|---|
| **Easy / Recovery Run** | `70–90% CTL` | `0.7×CTL – 0.9×CTL` per sesi | Cap ≤ 50–60 menit, ≤ 80% CP |
| **Moderate Aerobic Run** | `100–150% CTL` | `1.0×CTL – 1.5×CTL` per sesi | Mid-week aerobic |
| **Interval / Tempo Session** *(inc. W/U & C/D)* | `125–175% CTL` | `1.25×CTL – 1.75×CTL` per sesi | Sesi kualitas |
| **Long Run** | `150–300% CTL` | `1.5×CTL – 3.0×CTL` per sesi | HM: ~150–200% CTL, FM: ~300% CTL |

#### B. Mode Distance (Formula Jarak Coach Faris Salman)
Jika menghitung berbasis jarak (km):
- **Max Long Run**: $\min(3 \times \text{42d avg daily km},\ \text{90d Max LR} \times 1.04)$
- **Quality Workout**: $1.2 \times \text{42d avg daily km}$ (total harian inc. WU, interval, CD)
- **Easy Run**: $\text{Weekly Budget} - \text{Long Run} - \text{Workout}$ (dibagi 3–4 hari)

> [!IMPORTANT]
> **Single Run Safeguard**: Sebelum menetapkan target sesi Long Run, verifikasi bahwa TSS rencana ≤ 114% dari 30-Day Max TSS (atau ≤ 114% dari 90-day Max LR untuk jarak). Jika ≥ 115% → High Risk, kurangi durasi/jarak.

---

### Step 4: Generate Mesocycle Block Report

```markdown
### 📊 Matriks Perencanaan Mesosiklus 5 Minggu (Double Build — Coach Salman)

**Mode Budget**: [Load (TSS) / Distance (km)]
**Baseline CTL (42d Avg)**: [Value] load/hari (atau [X] km/hari → Baseline: [B] km)
**30-Day Max TSS / 90-Day Max LR**: [Max Value]

| Minggu | Fase | Total Budget | Perubahan vs W1 | Catatan & Fokus |
|---|---|---|---|---|
| **W1** | Baseline | [W1 Budget] | `0%` (referensi) | Stabilisasi ritme, adaptasi beban |
| **W2** | Build 1 | [W2 Budget] | `+5%` | Zona aman 🟢, fokus kenaikan LR/Quality |
| **W3** | Build 2 | [W3 Budget] | `+5% s.d. +8%` | 🟢 Opsi A (+8% recovery oke) / 🟡 Opsi B (+5% fatigue) |
| **W4** | **Planned Deload** | **[W4 Budget]** | **`−10% dari W1`** | **Restorasi otot & pemicu superkompensasi** |
| **W5** | New Baseline | [W5 Budget] | Baseline Baru | Hitung ulang 42d avg & 90d max LR |

---

### 📐 Target Beban per Tipe Sesi (Berbasis CTL Terkini: [CTL] load/hari)

| Tipe Sesi | Target Beban (load) | Setara Durasi (estimasi) |
|---|---|---|
| Easy / Recovery Run | [0.7×CTL] – [0.9×CTL] | ≤ 50–60 menit |
| Moderate Aerobic Run | [1.0×CTL] – [1.5×CTL] | 60–80 menit |
| Interval / Tempo Session | [1.25×CTL] – [1.75×CTL] | 50–80 menit (inc. W/U & C/D) |
| Long Run (HM Prep) | [1.5×CTL] – [2.0×CTL] | 90–140 menit |

---

💡 **Instruksi Taktis Coach untuk Deload Week (W4)**:
- **Long Run**: Scale down ~15% (batas bawah range ~1.5× CTL).
- **Workout**: Potong setengahnya (50%) atau SKIP sama sekali jika fatigue tinggi.
- **Easy Run**: Jaga intensitas santai (RPE 1–2, ≤ 80% CP), durasi cap normal tetap berlaku.
- Jangan tambah jarak ekstra meski badan mulai merasa sangat bugar — **ego management is key!**
```
