/**
 * Tools untuk gear catalog (sepeda, sepatu, dll) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGearTools(server: McpServer): void {
  server.registerTool(
    "get_gear_list",
    {
      title: "Get Gear List",
      description: "Ambil katalog gear (sepeda, sepatu, dll) beserta statistik dasarnya untuk seorang athlete.",
      inputSchema: {
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/gear`, { apiKey });
      return toToolResult(result);
    },
  );
}
