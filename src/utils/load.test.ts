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
  it("calculates weekly load budget correctly for daily load 50 with 5% ramp (legacy compatibility)", () => {
    const budget = calculateWeeklyBudget({ avgDailyLoad: 50, targetRampPct: 5 });
    expect(budget.totalWeeklyBudget).toBe(367.5);
    expect(budget.longRunMax).toBeGreaterThanOrEqual(110);
    expect(budget.longRunMax).toBeLessThanOrEqual(130);
  });

  it("throws RangeError for negative daily load", () => {
    expect(() => calculateWeeklyBudget({ avgDailyLoad: -10 })).toThrow(RangeError);
  });

  it("calculates Norwegian Singles time-based budget correctly for 6.0 hours/week", () => {
    const budget = calculateWeeklyBudget({ targetWeeklyHours: 6.0 });
    expect(budget.targetHours).toBe(6.0);
    expect(budget.totalMinutes).toBe(360);

    // Sub-threshold budget (20-25%)
    expect(budget.subThresholdBudget.totalMinutes).toBe(81); // 22.5% of 360
    expect(budget.subThresholdBudget.sessionsCount).toBe(3);
    expect(budget.subThresholdBudget.minutesPerSession).toBe(27);
    expect(budget.subThresholdBudget.percentage).toBe(22.5);

    // Easy budget (75-80%)
    expect(budget.easyBudget.totalMinutes).toBe(279); // 77.5% of 360
    expect(budget.easyBudget.longRunMinutes).toBe(75);
    expect(budget.easyBudget.easyRunsMinutes).toBe(204);
    expect(budget.easyBudget.easySessionsCount).toBe(4);

    // Guardrails
    expect(budget.guardrails.exceedsSafeWeeklyHeadroom).toBe(false);
    expect(budget.guardrails.easyDoublesRecommended).toBe(false);
    expect(budget.guardrails.status).toBe("SAFE");
    expect(budget.guardrails.sessionWorkDurationCapMinutes).toBe(45);
    expect(budget.guardrails.sessionWorkDistanceCapKm).toBe(12);
  });

  it("handles beginner/low volume 2 quality sessions count (§2.3)", () => {
    const budget = calculateWeeklyBudget({ targetWeeklyHours: 5.0, qualitySessionsCount: 2 });
    expect(budget.subThresholdBudget.sessionsCount).toBe(2);
    expect(budget.subThresholdBudget.totalMinutes).toBe(67.5);
    expect(budget.subThresholdBudget.minutesPerSession).toBe(33.8);
  });

  it("triggers §6.2 guardrail warnings and easy doubles for high volume >= 8.5 hours", () => {
    const budget = calculateWeeklyBudget({ targetWeeklyHours: 9.0 });
    expect(budget.guardrails.exceedsSafeWeeklyHeadroom).toBe(true);
    expect(budget.guardrails.easyDoublesRecommended).toBe(true);
    expect(budget.guardrails.status).toBe("APPROACHING_LIMIT");
    expect(budget.guardrails.notes.some((n) => n.includes("easy double"))).toBe(true);
    expect(budget.easyBudget.longRunMinutes).toBe(90);
  });

  it("throws RangeError for invalid targetWeeklyHours", () => {
    expect(() => calculateWeeklyBudget({ targetWeeklyHours: 0 })).toThrow(RangeError);
    expect(() => calculateWeeklyBudget({ targetWeeklyHours: -5 })).toThrow(RangeError);
    expect(() => calculateWeeklyBudget({ targetWeeklyHours: 25 })).toThrow(RangeError);
  });
});

describe("calculateDistanceBudget", () => {
  it("calculates weekly distance budget correctly for 6km avg daily mileage with 5% ramp", () => {
    const budget = calculateDistanceBudget({ avgDailyKm: 6, targetRampPct: 5 });
    expect(budget.baseWeeklyKm).toBe(42);
    expect(budget.totalWeeklyBudgetKm).toBe(44.1);
    expect(budget.palladinoLimitKm).toBe(18);
    expect(budget.maxLongRunKm).toBe(18);
    expect(budget.workoutBudgetKm).toBe(7.2);
    expect(budget.easyRunBudgetKm).toBe(18.9);
    expect(budget.unit).toBe("km");
  });

  it("implements Coach Faris Salman exact thread example: 8km avg, +8% ramp, 20km 90d max LR", () => {
    const budget = calculateDistanceBudget({
      avgDailyKm: 8,
      targetRampPct: 8,
      ninetyDayMaxLrKm: 20,
      workoutMultiplier: 1.2,
      longRunRiskPct: 104,
    });
    expect(budget.baseWeeklyKm).toBe(56);
    expect(budget.totalWeeklyBudgetKm).toBe(60.5);
    expect(budget.palladinoLimitKm).toBe(24);
    expect(budget.frandsenLimitKm).toBe(20.8);
    expect(budget.maxLongRunKm).toBe(20.8); // min(24, 20.8)
    expect(budget.workoutBudgetKm).toBe(9.6);
    expect(budget.easyRunBudgetKm).toBe(30.1);
    expect(budget.riskCategory).toContain("Main Aman");
  });

  it("throws RangeError for negative or zero daily distance", () => {
    expect(() => calculateDistanceBudget({ avgDailyKm: 0 })).toThrow(RangeError);
  });
});
