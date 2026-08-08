// src/tools/wellness.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("../client.js", () => ({
  intervalsRequest: vi.fn().mockResolvedValue([{ date: "2026-01-01", ctl: 60, atl: 55, tsb: 5 }]),
  resolveAthleteId: vi.fn().mockReturnValue({ id: "i12345" }),
  isApiError: vi.fn().mockReturnValue(false),
}));

import { intervalsRequest } from "../client.js";

describe("wellness tools registration", () => {
  it("intervalsRequest helper is imported and usable", () => {
    expect(typeof intervalsRequest).toBe("function");
  });
});
