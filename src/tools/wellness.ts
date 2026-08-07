/**
 * Tools untuk wellness data (HRV, sleep, resting HR, subjective scores, dll) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";

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

      const today = new Date().toISOString().slice(0, 10);
      const oldest = startDate ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
      const newest = endDate ?? today;

      const result = await intervalsRequest(`/athlete/${id}/wellness`, {
        params: { oldest, newest },
        apiKey,
      });
      return toToolResult(result);
    },
  );
}
