import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { analyzeCardiacDrift } from "../utils/drift.js";
import { calculateTaperPlan, predictRaceTime } from "../utils/race.js";
import { calculateReadinessScore } from "../utils/readiness.js";

/**
 * Register MCP Tools for Endurance Intelligence Suite.
 */
export function registerIntelligenceTools(server: McpServer): void {
  // 1. predict_race_time
  server.tool(
    "predict_race_time",
    "Memprediksi estimasi waktu finish & pace race (5K, 10K, Half Marathon, Full Marathon, atau jarak kustom) berbasis VDOT dengan koreksi CTL (kebugaran) & TSB (kesiapan).",
    {
      vdot: z.number().describe("Nilai VDOT atlet (misal 50)."),
      targetDistanceKm: z.number().describe("Jarak race dalam kilometer (misal 21.0975 untuk Half Marathon, 42.195 untuk Full Marathon)."),
      ctl: z.number().optional().describe("Nilai kebugaran kronis (CTL 42d). Default 50."),
      tsb: z.number().optional().describe("Nilai kesiapan akut (TSB/Form). Default 0."),
    },
    async ({ vdot, targetDistanceKm, ctl, tsb }) => {
      const result = predictRaceTime({ vdot, targetDistanceKm, ctl, tsb });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 2. calculate_taper_plan
  server.tool(
    "calculate_taper_plan",
    "Menghitung jadwal penurunan volume bertahap (tapering 2 atau 3 minggu) untuk memuncakkan TSB Freshness di hari Race A.",
    {
      raceDate: z.string().describe("Tanggal race format YYYY-MM-DD."),
      currentCtl: z.number().describe("CTL atlet saat ini."),
      currentTsb: z.number().describe("TSB atlet saat ini."),
      taperWeeks: z.number().optional().describe("Durasi minggu tapering (2 atau 3 minggu). Default 2."),
    },
    async ({ raceDate, currentCtl, currentTsb, taperWeeks }) => {
      const result = calculateTaperPlan({ raceDate, currentCtl, currentTsb, taperWeeks });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 3. analyze_cardiac_drift
  server.tool(
    "analyze_cardiac_drift",
    "Menganalisis stream telemetri (HR vs Power/Speed) untuk menghitung Efficiency Factor (EF) paruh 1 vs paruh 2 dan persentase Aerobic Decoupling.",
    {
      heartrateStream: z.array(z.number()).describe("Array time-series Heart Rate (bpm)."),
      powerOrSpeedStream: z.array(z.number()).describe("Array time-series Power (Watt) atau Speed (m/s)."),
    },
    async ({ heartrateStream, powerOrSpeedStream }) => {
      const result = analyzeCardiacDrift({ heartrateStream, powerOrSpeedStream });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 4. calculate_readiness_score
  server.tool(
    "calculate_readiness_score",
    "Memetakan TSB, ACWR, Sleep Score, HRV, dan RHR Spike ke dalam Skor Kesiapan Terpadu 0-100% (GREEN, YELLOW, RED).",
    {
      tsb: z.number().describe("Nilai TSB/Form atlet terkini."),
      acwr: z.number().describe("Nilai Acute:Chronic Workload Ratio terkini."),
      sleepScore: z.number().optional().describe("Skor kualitas tidur 0-100."),
      hrv: z.number().optional().describe("Nilai HRV rMSSD."),
      restingHr: z.number().optional().describe("Denyut jantung istirahat harian terkini."),
      baselineRestingHr: z.number().optional().describe("Baseline RHR normal atlet."),
    },
    async (input) => {
      const result = calculateReadinessScore(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
