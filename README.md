<div align="center">

# 🏃 intervals-icu-mcp

**MCP Server untuk [Intervals.icu](https://intervals.icu)**

Hubungkan AI agent (Claude, Antigravity, atau MCP client lain) langsung ke data training Anda di Intervals.icu — activities, wellness, calendar, gear, power curves, dan custom items.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.30-6366f1?style=flat-square)](https://github.com/modelcontextprotocol/typescript-sdk)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ✨ Fitur

- 📊 **Activities** — Ambil daftar aktivitas, detail, interval splits, dan time-series streams (power, HR, cadence, pace)
- 💤 **Wellness** — Data harian HRV, resting HR, sleep score, CTL/ATL
- 📅 **Calendar / Events** — List, detail, hapus event, buat planned workout & catatan
- ⚙️ **Gear** — Katalog sepatu, sepeda, dan peralatan lain
- 📈 **Power Curves** — Best power per durasi (MMP)
- 🗂️ **Custom Items** — Baca, buat, update, dan hapus custom item

## 🤖 Bonus: Running Coach AI (Template)

Project ini dilengkapi **template Antigravity skill & workflow** untuk membangun Running Coach AI personal berbasis data Intervals.icu Anda:

- **`/run-report`** — Slash-command untuk analisis pasca-sesi otomatis: tidak perlu upload CSV atau screenshot manual, data diambil langsung via MCP.
- **`running-coach-analysis`** — Skill yang berisi panduan analisis fisiologis (Aerobic Decoupling, Cardiac Drift, Efficiency Factor) dan format coaching report 4-bagian.

> Lihat panduan konfigurasi di [`.agents/README.md`](.agents/README.md).

---

## 🛠️ Tools (19)

| Kategori | Tool | Keterangan |
|---|---|---|
| **Activities** | `get_activities` | List aktivitas dalam rentang tanggal |
| | `get_activity_details` | Detail + profil fisiologis satu aktivitas |
| | `get_activity_intervals` | Data interval/lap per sesi |
| | `get_activity_streams` | Time-series: power, HR, cadence, pace |
| | `get_activity_messages` | Catatan/komentar pada aktivitas |
| | `add_activity_message` | Tambah catatan ke aktivitas |
| **Wellness** | `get_wellness_data` | Data wellness harian (HRV, sleep, RHR, CTL/ATL) |
| **Events/Calendar** | `get_events` | List event kalender |
| | `get_event_by_id` | Detail satu event |
| | `delete_event` | Hapus event |
| | `add_or_update_planned_workout` | Buat/update planned workout (support workout steps) |
| | `add_or_update_note` | Buat/update catatan di kalender |
| **Gear** | `get_gear_list` | Katalog gear |
| **Power Curves** | `get_athlete_power_curves` | Best power per durasi |
| **Custom Items** | `get_custom_items` | List custom item |
| | `get_custom_item_by_id` | Detail custom item |
| | `create_custom_item` | Buat custom item |
| | `update_custom_item` | Update custom item |
| | `delete_custom_item` | Hapus custom item |

Setiap tool menerima `apiKey` opsional (override per-call) dan sebagian besar menerima `athleteId` opsional (fallback ke `INTERVALS_ATHLETE_ID`).

---

## 🚀 Setup

### 1. Install & Build

```bash
pnpm install
pnpm run build
```

### 2. Konfigurasi Environment

Copy `.env.example` ke `.env` untuk testing lokal:

```bash
cp .env.example .env
```

Isi `.env` dengan kredensial Anda:

```env
INTERVALS_API_KEY=your_api_key_here
INTERVALS_ATHLETE_ID=i123456
```

- **`INTERVALS_API_KEY`**: Wajib. Ambil dari [Intervals.icu → Settings → Developer Settings](https://intervals.icu/settings).
- **`INTERVALS_ATHLETE_ID`**: Opsional. Jika kosong, wajib dikirim sebagai argumen `athleteId` di setiap tool call.

### 3. Konfigurasi MCP Client

#### Antigravity / Claude Desktop

Tambahkan ke MCP config Anda (`mcp_config.json` atau `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/path/absolut/ke/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "i123456"
      }
    }
  }
}
```

Restart client setelah edit config.

---

## 🔍 Debug Lokal

```bash
pnpm run inspector
```

Membuka [MCP Inspector](https://github.com/modelcontextprotocol/inspector) untuk mencoba tiap tool secara interaktif tanpa perlu connect ke client dulu.

---

## 📁 Struktur Project

```
intervals-icu-mcp/
├── src/
│   ├── index.ts          # Entry point, register semua tools, jalankan stdio transport
│   ├── config.ts         # Load environment variables
│   ├── client.ts         # HTTP client (Basic Auth, error handling)
│   ├── types.ts          # Helper convert ApiResult → CallToolResult
│   └── tools/
│       ├── activities.ts
│       ├── wellness.ts
│       ├── events.ts
│       ├── gear.ts
│       ├── powerCurves.ts
│       └── customItems.ts
├── .agents/              # Template Antigravity Agent konfigurasi (opsional)
│   ├── skills/running-coach-analysis/SKILL.md
│   └── workflows/run-report.md
├── .env.example
└── .gitignore
```

---

## ⚠️ Known Limitations

- Belum ada tool untuk athlete profile atau training zones secara langsung — bisa ditambah mengikuti pola yang sama di `src/tools/`.
- `get_athlete_power_curves` mengembalikan raw response dari API; parsing tambahan bisa dilakukan di sisi client.
- Belum ada rate-limit handling khusus di luar pesan error 429.

---

## 📚 Referensi API

- **Base URL**: `https://intervals.icu/api/v1`
- **Auth**: HTTP Basic Auth — username selalu `API_KEY`, password adalah API key Anda.
- **Swagger Docs**: [https://intervals.icu/api-docs.html](https://intervals.icu/api-docs.html)

> Struktur endpoint di project ini juga diverifikasi dari [`mvilanova/intervals-mcp-server`](https://github.com/mvilanova/intervals-mcp-server), MCP server intervals.icu versi Python.

---

## 📄 License

[MIT](LICENSE)
