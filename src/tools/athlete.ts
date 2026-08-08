/**
 * Tools untuk athlete profile dan training zones di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const athleteProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  ftp: z.number().optional(),
  lthr: z.number().optional(),
  thresholdPace: z.string().optional(),
  sportSettings: z.array(z.unknown()).optional(),
});

export function registerAthleteTools(server: McpServer): void {
  server.registerTool(
    "get_athlete_profile",
    {
      title: "Get Athlete Profile",
      description:
        "Ambil profil lengkap athlete dari Intervals.icu, termasuk FTP, LTHR, threshold pace, dan konfigurasi sport.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu (contoh: i123456). Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_training_zones",
    {
      title: "Get Training Zones",
      description:
        "Ambil zona latihan athlete (HR zones, power zones, pace zones) berdasarkan profil dan sport settings-nya.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        sport: z
          .string()
          .optional()
          .describe("Filter sport tertentu, misal 'Run', 'Ride', 'Swim'. Default semua sport."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, sport, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}`, {
        params: sport ? { sport } : undefined,
        apiKey,
      });
      return toToolResult(result);
    },
  );
}
