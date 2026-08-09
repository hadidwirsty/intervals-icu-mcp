/**
 * MCP Tools untuk analisis fisiologis beban latihan (Training Load, ACWR, TSB & Budgeting).
 */

import { z } from "zod";

import { errorResult } from "../types.js";
import { analyzeTrainingLoad, calculateDistanceBudget, calculateWeeklyBudget } from "../utils/load.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function registerLoadTools(server: McpServer): void {
  server.registerTool(
    "analyze_training_load",
    {
      title: "Analyze Training Load & ACWR",
      description:
        "Analisis fisiologis beban latihan: menghitung ACWR (Acute:Chronic Workload Ratio), mengklasifikasikan Zona TSB (Transition, Fresh, Grey Zone, Optimal, High Risk), serta mengevaluasi risiko Ramp Rate.",
      inputSchema: {
        ctl: z.number().positive().describe("Chronic Training Load / 42d avg daily load."),
        atl: z.number().min(0).describe("Acute Training Load / 7d avg daily load."),
        tsb: z.number().optional().describe("Training Stress Balance (ctl - atl). Dihitung otomatis jika diabaikan."),
        rampRate: z.number().optional().describe("Ramp rate 7-hari / 28-hari per minggu."),
      },
    },
    async ({ ctl, atl, tsb, rampRate }) => {
      try {
        const result = analyzeTrainingLoad({ ctl, atl, tsb, rampRate });
        return jsonResult(result);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "calculate_weekly_budget",
    {
      title: "Calculate Weekly Training Budget",
      description:
        "Hitung budget latihan mingguan (Total Budget, Long Run Max, Quality/Interval Max, Easy Run Budget) berdasarkan 42d avg load/distance dan target ramp rate aman.",
      inputSchema: {
        avgDailyLoad: z
          .number()
          .positive()
          .describe("Rata-rata load (TSS) atau jarak (km) harian 42 hari terakhir (CTL)."),
        mode: z
          .enum(["load", "distance"])
          .optional()
          .default("load")
          .describe("Mode budget: 'load' (default, TSS) atau 'distance' (km)."),
        targetRampPct: z
          .number()
          .min(-50)
          .max(30)
          .optional()
          .describe("Persentase target kenaikan beban mingguan (default: 5%). Contoh: 5 untuk +5%."),
      },
    },
    async ({ avgDailyLoad, mode, targetRampPct }) => {
      try {
        if (mode === "distance") {
          const result = calculateDistanceBudget({ avgDailyKm: avgDailyLoad, targetRampPct });
          return jsonResult(result);
        }
        const result = calculateWeeklyBudget({ avgDailyLoad, targetRampPct });
        return jsonResult(result);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
