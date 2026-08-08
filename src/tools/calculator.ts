/**
 * MCP Tools untuk kalkulasi fisiologis lari berbasis lokal.
 * Tidak memerlukan API call ke Intervals.icu — pure computation.
 */

import { z } from "zod";

import { errorResult } from "../types.js";
import { calculatePaceZones, calculateVdot } from "../utils/vdot.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Mengkonversi string waktu race ke total detik.
 * Menerima format "MM:SS" atau "HH:MM:SS".
 * @throws {Error} jika format tidak valid.
 */
export function parseRaceTime(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) {
    throw new Error(`Format waktu tidak valid: "${timeStr}". Gunakan "MM:SS" atau "HH:MM:SS".`);
  }

  const parts = timeStr.split(":").map(Number);
  if (parts.some(isNaN)) {
    throw new Error(`Format waktu mengandung karakter non-numerik: "${timeStr}".`);
  }

  if (parts.length === 2) {
    const [minutes = 0, seconds = 0] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  throw new Error(`Format waktu tidak dikenali: "${timeStr}". Gunakan "MM:SS" atau "HH:MM:SS".`);
}

function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function registerCalculatorTools(server: McpServer): void {
  server.registerTool(
    "calculate_vdot",
    {
      title: "Calculate VDOT",
      description:
        "Hitung skor VDOT (estimasi VO₂max) dari hasil race atau sesi tempo. Formula: Jack Daniels Running Formula. Tidak memerlukan koneksi ke Intervals.icu.",
      inputSchema: {
        raceTime: z
          .string()
          .describe('Waktu race/tempo, format "MM:SS" atau "HH:MM:SS". Contoh: "45:00" untuk 45 menit.'),
        distanceKm: z
          .number()
          .positive()
          .optional()
          .describe("Jarak dalam kilometer, contoh: 10 untuk 10K."),
        distanceMeters: z
          .number()
          .positive()
          .optional()
          .describe("Jarak dalam meter, contoh: 10000. Diabaikan jika distanceKm ada."),
      },
    },
    async ({ raceTime, distanceKm, distanceMeters }) => {
      try {
        const meters = distanceKm !== undefined ? distanceKm * 1000 : distanceMeters;
        if (!meters) {
          return errorResult("Berikan salah satu: distanceKm atau distanceMeters.");
        }

        const totalSeconds = parseRaceTime(raceTime);
        const vdot = calculateVdot(meters, totalSeconds);

        return jsonResult({
          vdot,
          input: {
            distanceKm: meters / 1000,
            raceTime,
          },
          interpretation:
            vdot >= 70
              ? "Elite / Sub-elite"
              : vdot >= 55
                ? "Advanced / Competitive Age Grouper"
                : vdot >= 45
                  ? "Intermediate"
                  : vdot >= 35
                    ? "Beginner to Recreational"
                    : "Sedang berkembang",
        });
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "calculate_pace_zones",
    {
      title: "Calculate Pace Zones",
      description:
        "Hitung zona pace latihan lari (Easy, Marathon, Threshold, Interval, Repetition) berdasarkan skor VDOT atau threshold pace. Tidak memerlukan koneksi ke Intervals.icu.",
      inputSchema: {
        vdot: z
          .number()
          .min(30)
          .max(85)
          .optional()
          .describe("Skor VDOT (30–85). Gunakan tool calculate_vdot untuk mendapatkan nilai ini."),
        thresholdPacePerKm: z
          .string()
          .optional()
          .describe(
            'Pace Threshold Run per kilometer, format "MM:SS". Digunakan sebagai alternatif VDOT. Contoh: "4:30".',
          ),
      },
    },
    async ({ vdot, thresholdPacePerKm }) => {
      try {
        let vdotScore = vdot;

        if (vdotScore === undefined && thresholdPacePerKm) {
          const thresholdSeconds = parseRaceTime(thresholdPacePerKm);
          vdotScore = calculateVdot(1000, thresholdSeconds) / 0.88;
          vdotScore = Math.round(vdotScore * 10) / 10;
        }

        if (vdotScore === undefined) {
          return errorResult("Berikan salah satu: vdot atau thresholdPacePerKm.");
        }

        const zones = calculatePaceZones(vdotScore);
        return jsonResult({
          vdot: vdotScore,
          zones,
          usage: {
            easy: "Lari recovery, long run. Bisa ngobrol dengan nyaman.",
            marathon: "Pace maraton target.",
            threshold: "Tempo run 20–60 menit. 'Comfortably hard'.",
            interval: "Repetisi 3–5 menit dengan recovery penuh.",
            repetition: "Sprint pendek 200–400m dengan recovery sangat panjang.",
          },
        });
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
