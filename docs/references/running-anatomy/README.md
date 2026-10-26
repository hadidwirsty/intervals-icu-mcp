# Running Anatomy & Muscle Armor for Endurance Runners

Koleksi literatur ini mendokumentasikan anatomi fungsional, biomekanika langkah lari (*running gait cycle*), serta panduan penguatan 8 kelompok otot utama yang terdampak saat berlari. Digunakan sebagai landasan sains untuk skill `/strength-guide` dan proteksi muskuloskeletal pelari.

---

## 📑 Daftar Berkas Literatur

1. [**`01-semua-otot-utama-saat-lari-dan-strength-training.md`**](./01-semua-otot-utama-saat-lari-dan-strength-training.md)  
   *Panduan Komprehensif: 8 Kelompok Otot Utama, Peran Kinematika Fase Langkah, Risiko Cedera Spesifik, Latihan Beban Terpilih, dan Frekuensi Latihan Ideal.*

---

## 🎯 8 Kelompok Otot Kunci Pelari

```mermaid
graph TD
    subgraph LOWER_EXTREMITY["1. TUNGKAI BAWAH (Absorpsi & Pegas)"]
        O1["Gastrocnemius & Soleus (Betis)<br/>Daya Dorong & Pegas Achilles (6–8x BW)"]
        O2["Tibialis Anterior (Shin / Tulang Kering)<br/>Dorsofleksi & Pencegah Shin Splints"]
    end

    subgraph THIGH_HIP["2. PAHA & PANGGUL (Penggerak & Penstabil)"]
        O3["Quadriceps (Paha Depan)<br/>Peredam Benturan & Ekstensi Lutut"]
        O4["Hamstring (Paha Belakang)<br/>Deselerasi Ayunan & Ekstensi Panggul"]
        O5["Gluteus Maximus & Medius<br/>Mesin Utama Lari & Penstabil Pelvis Frontal"]
        O6["Iliopsoas / Psoas (Hip Flexor)<br/>Knee Drive & Frekuensi Langkah"]
        O7["Adductors (Paha Dalam)<br/>Stabilitas Pelvic Ring & Kontrol Femur"]
    end

    subgraph TRUNK["3. BATANG TUBUH (Fondasi Postur)"]
        O8["Core + Erector Spinae<br/>Anti-Extension, Proteksi Lumbar, Stay Tall"]
    end

    LOWER_EXTREMITY --> THIGH_HIP --> TRUNK
```

---

## 🔗 Hubungan dengan Sistem Kepelatihan
- **Skill Terkait**: [`.agents/skills/panduan-kekuatan/SKILL.md`](../../.agents/skills/panduan-kekuatan/SKILL.md)
- **Guardrails**: [`.agents/rules/norwegian-singles-guardrails.md`](../../.agents/rules/norwegian-singles-guardrails.md)
- **Konteks Fisiologis**: Proteksi muskuloskeletal rantai kinetik tungkai bawah dan stabilitas tulang belakang (McGill Big 3).
