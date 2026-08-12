// src/utils/race.test.ts
import { describe, expect, it } from "vitest";
import { calculateTaperPlan, predictRaceTime } from "./race.js";

describe("predictRaceTime", () => {
  it("predicts half marathon time for VDOT 50", () => {
    const result = predictRaceTime({ vdot: 50, targetDistanceKm: 21.0975, ctl: 50, tsb: 10 });
    expect(result.predictedTimeSeconds).toBeGreaterThan(4800); // ~1h27m-1h35m
    expect(result.predictedPaceFormatted).toMatch(/^\d{1,2}:\d{2}\/km$/);
  });

  it("throws error for negative VDOT or distance", () => {
    expect(() => predictRaceTime({ vdot: 0, targetDistanceKm: 10 })).toThrow();
  });
});

describe("calculateTaperPlan", () => {
  it("generates 2-week taper plan", () => {
    const plan = calculateTaperPlan({ raceDate: "2026-10-15", currentCtl: 60, currentTsb: -5, taperWeeks: 2 });
    expect(plan.weeklySchedule).toHaveLength(2);
    expect(plan.weeklySchedule[0].volumePct).toBe(75);
    expect(plan.weeklySchedule[1].volumePct).toBe(50);
  });
});
