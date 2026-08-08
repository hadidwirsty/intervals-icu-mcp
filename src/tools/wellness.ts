/**
 * Tools untuk wellness data (HRV, sleep, resting HR, subjective scores, dll) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";
import { getDefaultDateRange } from "../utils/date.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerWellnessTools(server: McpServer): void {
  server.registerTool(
    "get_wellness_data",
    {
      title: "Get Wellness Data",
      description:
        "Ambil data wellness harian athlete (training metrics, HRV, resting HR, sleep, subjective scores, dll) dalam rentang tanggal tertentu.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        startDate: z.string().optional().describe("Tanggal mulai, format YYYY-MM-DD. Default 30 hari lalu."),
        endDate: z.string().optional().describe("Tanggal akhir, format YYYY-MM-DD. Default hari ini."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, startDate, endDate, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const defaultRange = getDefaultDateRange(30);
      const oldest = startDate ?? defaultRange.oldest;
      const newest = endDate ?? defaultRange.newest;

      const result = await intervalsRequest(`/athlete/${id}/wellness`, {
        params: { oldest, newest },
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_fitness_chart",
    {
      title: "Get Fitness Chart (CTL/ATL/TSB)",
      description:
        "Ambil time-series data beban latihan (CTL, ATL, TSB, Ramp Rate, eFTP) athlete dalam rentang tanggal. Berguna untuk analisis periodisasi dan perencanaan taper.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        startDate: z
          .string()
          .optional()
          .describe("Tanggal mulai, format YYYY-MM-DD. Default 90 hari lalu."),
        endDate: z
          .string()
          .optional()
          .describe("Tanggal akhir, format YYYY-MM-DD. Default hari ini."),
        cols: z
          .string()
          .optional()
          .describe(
            "Kolom yang diinginkan (comma-separated). Default: 'ctl,atl,tsb,rampRate,eftp'. Pilihan lain: ctlLoad, atlLoad.",
          ),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, startDate, endDate, cols, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const defaultRange = getDefaultDateRange(90);
      const oldest = startDate ?? defaultRange.oldest;
      const newest = endDate ?? defaultRange.newest;
      const columns = cols ?? "ctl,atl,tsb,rampRate,eftp";

      const result = await intervalsRequest(`/athlete/${id}/wellness`, {
        params: { oldest, newest, cols: columns },
        apiKey,
      });
      return toToolResult(result);
    },
  );
}
