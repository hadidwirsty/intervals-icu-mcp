// src/utils/date.test.ts
import { describe, expect, it } from "vitest";
import { getDefaultDateRange } from "./date.js";

describe("getDefaultDateRange", () => {
  it("should return a range of approximately N days", () => {
    const { oldest, newest } = getDefaultDateRange(30);
    const diffMs = new Date(newest).getTime() - new Date(oldest).getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it("should return ISO date strings in YYYY-MM-DD format", () => {
    const { oldest, newest } = getDefaultDateRange(7);
    expect(oldest).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(newest).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("newest should always be today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const { newest } = getDefaultDateRange(10);
    expect(newest).toBe(today);
  });
});
