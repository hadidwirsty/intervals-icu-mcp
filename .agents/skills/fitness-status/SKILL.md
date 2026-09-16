---
name: fitness-status
description: Alias/trigger cepat untuk skill `training-load-analysis`. Tidak berisi logika sendiri — dipertahankan hanya sebagai command pendek `/fitness-status` peninggalan workflow Antigravity. Semua definisi metrik, sumber (Bagian A NSA vs Bagian B non-NSA), dan format laporan ada di `training-load-analysis`.
---

# Skill: `/fitness-status` (alias)

> **Catatan**: skill ini dulunya duplikat penuh dari `training-load-analysis` (peninggalan workflow Antigravity 2.0). Sudah disederhanakan jadi alias tipis supaya tidak ada dua sumber kebenaran yang bisa saling tidak sinkron. Jangan tambahkan logika/metrik baru di file ini — tambahkan di `training-load-analysis`, alias ini akan otomatis ikut.

## Perilaku

Saat trigger `/fitness-status` (dengan atau tanpa argumen tanggal) dipanggil:

1. Jalankan skill `.agents/skills/training-load-analysis/SKILL.md` sepenuhnya — ikuti workflow MCP-nya (`get_fitness_chart`, `analyze_training_load`, `get_wellness_data`) dan format laporannya (Bagian A — Sumber NSA / Bagian B — Lapisan Tambahan) apa adanya, tanpa modifikasi.
2. Jika ada argumen tanggal (`/fitness-status 2026-09-15`), teruskan sebagai `endDate` ke `training-load-analysis` (dengan `startDate` = 90 hari sebelumnya, sesuai konvensi skill tersebut).
3. Jika tidak ada argumen, gunakan hari ini sebagai `endDate`.

## Format Prompt Penggunaan

```text
/fitness-status
```
atau
```text
/fitness-status 2026-09-15
```

Keduanya setara dengan memanggil `/training-load-analysis` (atau nama trigger command skill tersebut) dengan parameter yang sama.