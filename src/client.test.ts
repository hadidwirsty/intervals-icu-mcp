// src/client.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock config
vi.mock("./config.js", () => ({
  config: { apiKey: "test-key", athleteId: "i123", baseUrl: "https://intervals.icu/api/v1" },
}));

// Mock utility
vi.mock("./utils/retry.js", () => ({
  calculateRetryDelay: vi.fn().mockReturnValue(0), // No delay in tests
}));

import { intervalsRequest, isApiError } from "./client.js";

describe("intervalsRequest retry behavior", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not retry on 401 Unauthorized", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
      headers: { get: () => null },
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await intervalsRequest("/test");
    expect(isApiError(result)).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1); // No retry
  });

  it("should retry on 429 and succeed on 2nd attempt", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          text: async () => "Rate Limited",
          headers: { get: (h: string) => (h === "Retry-After" ? "0" : null) },
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ data: "success" }),
        headers: { get: () => null },
      };
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await intervalsRequest("/test");
    expect(isApiError(result)).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
