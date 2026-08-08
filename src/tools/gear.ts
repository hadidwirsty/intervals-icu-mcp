/**
 * Tools untuk gear catalog (sepeda, sepatu, dll) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, isApiError, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";
import { InMemoryCache } from "../utils/cache.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const GEAR_CACHE_TTL_MS = 30 * 60 * 1000; // 30 menit
const gearCache = new InMemoryCache<unknown>();

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

      const cacheKey = `get_gear_list:${id}`;
      const cached = gearCache.get(cacheKey);
      if (cached !== undefined) {
        return toToolResult(cached);
      }

      const result = await intervalsRequest(`/athlete/${id}/gear`, { apiKey });
      if (!isApiError(result)) {
        gearCache.set(cacheKey, result, GEAR_CACHE_TTL_MS);
      }
      return toToolResult(result);
    },
  );
}
