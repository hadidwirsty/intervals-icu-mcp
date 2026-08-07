/**
 * Konfigurasi environment untuk Intervals.icu MCP Server.
 */

export interface Config {
  apiKey: string;
  athleteId: string;
  baseUrl: string;
}

export function loadConfig(): Config {
  const apiKey = process.env.INTERVALS_API_KEY ?? "";
  const athleteId = process.env.INTERVALS_ATHLETE_ID ?? "";
  const baseUrl = process.env.INTERVALS_API_BASE_URL ?? "https://intervals.icu/api/v1";

  if (!apiKey) {
    console.error(
      "[intervals-icu-mcp] WARNING: INTERVALS_API_KEY belum diset. Set lewat environment variable atau kirim per-call.",
    );
  }

  return { apiKey, athleteId, baseUrl };
}

export const config: Config = loadConfig();
