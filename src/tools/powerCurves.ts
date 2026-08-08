/**
 * Tools untuk power curves (best power per durasi) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, isApiError, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";
import { InMemoryCache } from "../utils/cache.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const DEFAULT_DURATIONS = [5, 15, 30, 60, 120, 300, 600, 1200, 3600];
const POWER_CURVE_CACHE_TTL_MS = 60 * 60 * 1000; // 60 menit
const powerCurveCache = new InMemoryCache<unknown>();

export function registerPowerCurveTools(server: McpServer): void {
  server.registerTool(
    "get_athlete_power_curves",
    {
      title: "Get Athlete Power Curves",
      description:
        "Ambil power curve (best power per durasi, dalam watt) seorang athlete untuk musim ini/lalu, dan/atau rentang tanggal custom.",
      inputSchema: {
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        activityType: z.string().optional().describe("Tipe aktivitas, contoh: Ride, Run, VirtualRide. Default 'Ride'."),
        durations: z
          .array(z.number().int().positive())
          .optional()
          .describe("Durasi dalam detik. Default [5,15,30,60,120,300,600,1200,3600]."),
        indoorOutdoor: z.enum(["indoor", "outdoor"]).optional().describe("Filter lokasi aktivitas."),
        startDate: z.string().optional().describe("Tanggal mulai custom range YYYY-MM-DD (harus dipasangkan dengan endDate)."),
        endDate: z.string().optional().describe("Tanggal akhir custom range YYYY-MM-DD (harus dipasangkan dengan startDate)."),
        thisSeason: z.boolean().optional().describe("Sertakan curve musim ini. Default true."),
        lastSeason: z.boolean().optional().describe("Sertakan curve musim lalu. Default true."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({
      athleteId,
      activityType,
      durations,
      indoorOutdoor,
      startDate,
      endDate,
      thisSeason,
      lastSeason,
      apiKey,
    }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      if ((startDate === undefined) !== (endDate === undefined)) {
        return errorResult("startDate dan endDate harus diisi berdua untuk custom date range.");
      }

      const curves: string[] = [];
      if (thisSeason ?? true) curves.push("s0");
      if (lastSeason ?? true) curves.push("s1");
      if (startDate && endDate) curves.push(`r.${startDate}.${endDate}`);

      if (curves.length === 0) {
        return errorResult("Minimal satu curve harus dipilih (thisSeason, lastSeason, atau date range).");
      }

      const cacheKey = `power_curve:${id}:${activityType ?? "Ride"}:${curves.join(",")}:${indoorOutdoor ?? "all"}`;
      const cached = powerCurveCache.get(cacheKey);
      if (cached !== undefined) {
        const payload = cached as unknown;
        if (durations && durations.length > 0) {
          return toToolResult({ requestedDurations: durations, curves: payload });
        }
        return toToolResult(payload);
      }

      const params: Record<string, string | number | boolean | string[]> = {
        curves,
        type: activityType ?? "Ride",
        includeRanks: false,
      };
      if (indoorOutdoor) {
        params.filters = JSON.stringify([{ field_id: "indoor", value: indoorOutdoor, id: 1 }]);
      }

      const result = await intervalsRequest(`/athlete/${id}/power-curves`, { params, apiKey });

      if (!isApiError(result)) {
        powerCurveCache.set(cacheKey, result, POWER_CURVE_CACHE_TTL_MS);
      }

      // durations dipakai klien pemanggil untuk menyaring hasil; sertakan sebagai info di response mentah.
      if (durations && durations.length > 0 && !isApiError(result)) {
        return toToolResult({ requestedDurations: durations, curves: result });
      }
      return toToolResult(result);
    },
  );
}
