/**
 * HTTP client untuk Intervals.icu API.
 *
 * Auth: HTTP Basic Auth, username selalu literal "API_KEY",
 * password adalah API key milik athlete (lihat Settings > Developer di intervals.icu).
 */

import { config } from "./config.js";
import { calculateRetryDelay } from "./utils/retry.js";

export interface ApiError {
  error: true;
  statusCode?: number;
  message: string;
}

export type ApiResult<T> = T | ApiError;

export function isApiError(result: unknown): result is ApiError {
  return typeof result === "object" && result !== null && (result as ApiError).error === true;
}

const ERROR_MESSAGES: Record<number, string> = {
  401: "401 Unauthorized: Cek kembali API key kamu.",
  403: "403 Forbidden: Kamu mungkin tidak punya izin untuk resource ini.",
  404: "404 Not Found: Endpoint atau ID yang diminta tidak ditemukan.",
  422: "422 Unprocessable Entity: Parameter request tidak valid.",
  429: "429 Too Many Requests: Terlalu banyak request dalam waktu singkat.",
  500: "500 Internal Server Error: Intervals.icu mengalami error internal.",
  503: "503 Service Unavailable: Intervals.icu mungkin sedang down/maintenance.",
};

type ParamValue = string | number | boolean | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, ParamValue | ParamValue[]>;
  body?: unknown;
  apiKey?: string;
  maxRetries?: number;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${config.baseUrl}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined) url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function intervalsRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", params, body, apiKey, maxRetries = 3 } = options;

  const keyToUse = apiKey ?? config.apiKey;
  if (!keyToUse) {
    return {
      error: true,
      message: "API key tidak tersedia. Set INTERVALS_API_KEY atau kirim apiKey per-call.",
    };
  }

  const url = buildUrl(path, params);
  const basicAuth = Buffer.from(`API_KEY:${keyToUse}`).toString("base64");
  const headers: Record<string, string> = {
    Authorization: `Basic ${basicAuth}`,
    Accept: "application/json",
    "User-Agent": "intervals-icu-mcp/0.1.0",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (response.status === 429 && attempt < maxRetries) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        const delay = calculateRetryDelay(attempt, retryAfterSeconds);

        console.error(
          `[intervals-icu-mcp] Rate limited (429). Retry ${attempt + 1}/${maxRetries} dalam ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const text = await response.text();

      if (!response.ok) {
        return {
          error: true,
          statusCode: response.status,
          message: ERROR_MESSAGES[response.status] ?? `HTTP ${response.status}: ${text}`,
        };
      }

      let data: unknown = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      return data as T;
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = calculateRetryDelay(attempt);
        console.error(`[intervals-icu-mcp] Request error, retry ${attempt + 1}/${maxRetries}: ${err}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return {
        error: true,
        message: `Request error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return {
    error: true,
    message: "429 Too Many Requests: Semua retry habis. Coba lagi nanti.",
  };
}

/** Resolve athleteId dari argumen tool, fallback ke INTERVALS_ATHLETE_ID env. Prefix "i" ditambahkan otomatis kalau belum ada. */
export function resolveAthleteId(athleteId?: string): { id?: string; error?: string } {
  const raw = athleteId ?? config.athleteId;
  if (!raw) {
    return {
      error:
        "athleteId tidak diberikan dan INTERVALS_ATHLETE_ID tidak diset di environment.",
    };
  }
  const id = raw.startsWith("i") ? raw : `i${raw}`;
  return { id };
}
