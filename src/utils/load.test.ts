// src/utils/load.test.ts
import { describe, expect, it } from "vitest";
import { analyzeTrainingLoad, calculateDistanceBudget, calculateWeeklyBudget } from "./load.js";

describe("analyzeTrainingLoad", () => {
  it("calculates ACWR correctly and returns Sweet Spot for CTL 50, ATL 50", () => {
    const result = analyzeTrainingLoad({ ctl: 50, atl: 50 });
    expect(result.acwr).toBe(1.0);
    expect(result.acwrCategory).toBe("Sweet Spot");
  });

  it("identifies Danger Zone when ACWR > 1.5", () => {
    const result = analyzeTrainingLoad({ ctl: 50, atl: 80 });
    expect(result.acwr).toBe(1.6);
    expect(result.acwrCategory).toBe("Danger Zone");
  });

  it("classifies TSB -12 as Optimal Training Zone", () => {
    const result = analyzeTrainingLoad({ ctl: 50, atl: 62 });
    expect(result.tsb).toBe(-12);
    expect(result.tsbZone).toBe("Optimal Training Zone");
  });

  it("classifies TSB +10 as Fresh / Race Ready", () => {
    const result = analyzeTrainingLoad({ ctl: 50, atl: 40 });
    expect(result.tsb).toBe(10);
    expect(result.tsbZone).toBe("Fresh / Race Ready");
  });

  it("throws RangeError for CTL <= 0", () => {
    expect(() => analyzeTrainingLoad({ ctl: 0, atl: 40 })).toThrow(RangeError);
  });
});

describe("calculateWeeklyBudget", () => {
  it("calculates weekly load budget correctly for daily load 50 with 5% ramp", () => {
    const budget = calculateWeeklyBudget({ avgDailyLoad: 50, targetRampPct: 5 });
    expect(budget.totalWeeklyBudget).toBe(367.5);
    expect(budget.longRunMax).toBeGreaterThanOrEqual(110);
    expect(budget.longRunMax).toBeLessThanOrEqual(130);
  });

  it("throws RangeError for negative daily load", () => {
    expect(() => calculateWeeklyBudget({ avgDailyLoad: -10 })).toThrow(RangeError);
  });
});

describe("calculateDistanceBudget", () => {
  it("calculates weekly distance budget correctly for 6km avg daily mileage with 5% ramp", () => {
    const budget = calculateDistanceBudget({ avgDailyKm: 6, targetRampPct: 5 });
    expect(budget.totalWeeklyBudgetKm).toBe(44.1);
    expect(budget.longRunMaxKm).toBe(15.4);
    expect(budget.qualityIntervalMaxKm).toBe(8.8);
    expect(budget.easyRunMinKm).toBe(19.8);
    expect(budget.unit).toBe("km");
  });

  it("throws RangeError for negative or zero daily distance", () => {
    expect(() => calculateDistanceBudget({ avgDailyKm: 0 })).toThrow(RangeError);
  });
});
