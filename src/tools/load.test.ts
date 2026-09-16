import { describe, expect, it } from "vitest";
import { analyzeTrainingLoad, calculateDistanceBudget, calculateWeeklyBudget } from "../utils/load.js";

describe("MCP Load Tools Logic", () => {
  it("correctly executes analyzeTrainingLoad for MCP tool", () => {
    const res = analyzeTrainingLoad({ ctl: 45, atl: 50 });
    expect(res.acwrCategory).toBe("Sweet Spot");
  });

  it("correctly executes calculateWeeklyBudget for MCP tool with legacy avgDailyLoad", () => {
    const res = calculateWeeklyBudget({ avgDailyLoad: 40 });
    expect(res.totalWeeklyBudget).toBe(294);
  });

  it("correctly executes calculateWeeklyBudget with targetWeeklyHours (Norwegian Singles duration mode)", () => {
    const res = calculateWeeklyBudget({ targetWeeklyHours: 6.0, qualitySessionsCount: 3 });
    expect(res.targetHours).toBe(6.0);
    expect(res.totalMinutes).toBe(360);
    expect(res.subThresholdBudget.totalMinutes).toBe(81);
    expect(res.easyBudget.totalMinutes).toBe(279);
    expect(res.guardrails.status).toBe("SAFE");
  });

  it("correctly executes calculateDistanceBudget for MCP tool", () => {
    const res = calculateDistanceBudget({ avgDailyKm: 6 });
    expect(res.totalWeeklyBudgetKm).toBe(44.1);
    expect(res.unit).toBe("km");
  });
});
