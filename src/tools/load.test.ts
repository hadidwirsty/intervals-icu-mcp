// src/tools/load.test.ts
import { describe, expect, it } from "vitest";
import { analyzeTrainingLoad, calculateWeeklyBudget } from "../utils/load.js";

describe("MCP Load Tools Logic", () => {
  it("correctly executes analyzeTrainingLoad for MCP tool", () => {
    const res = analyzeTrainingLoad({ ctl: 45, atl: 50 });
    expect(res.acwrCategory).toBe("Sweet Spot");
  });

  it("correctly executes calculateWeeklyBudget for MCP tool", () => {
    const res = calculateWeeklyBudget({ avgDailyLoad: 40 });
    expect(res.totalWeeklyBudget).toBe(294);
  });
});
