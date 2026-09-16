// src/utils/date.test.ts
import { describe, expect, it } from "vitest";
import { addDays, getDefaultDateRange, getMondayOfDate } from "./date.js";

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

describe("addDays", () => {
  it("adds days correctly within same month", () => {
    expect(addDays("2026-09-21", 1)).toBe("2026-09-22");
    expect(addDays("2026-09-21", 6)).toBe("2026-09-27");
  });

  it("handles month transition", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  });

  it("throws on invalid format", () => {
    expect(() => addDays("invalid", 1)).toThrow();
  });
});

describe("getMondayOfDate", () => {
  it("returns same date if already Monday", () => {
    expect(getMondayOfDate("2026-09-21")).toBe("2026-09-21");
  });

  it("returns preceding Monday for Wednesday", () => {
    expect(getMondayOfDate("2026-09-23")).toBe("2026-09-21");
  });

  it("returns preceding Monday for Sunday", () => {
    expect(getMondayOfDate("2026-09-27")).toBe("2026-09-21");
  });
});
