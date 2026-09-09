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
  it("generates 2-week taper plan for Race A by default", () => {
    const plan = calculateTaperPlan({ raceDate: "2026-10-15", currentCtl: 60, currentTsb: -5, taperWeeks: 2 });
    expect(plan.racePriority).toBe("A");
    expect(plan.taperTypeDescription).toContain("A-Taper");
    expect(plan.targetFinishRpe).toContain("9–10 / 10");
    expect(plan.weeklySchedule).toHaveLength(2);
    expect(plan.weeklySchedule[0].volumePct).toBe(75);
    expect(plan.weeklySchedule[1].volumePct).toBe(50);
    expect(plan.weeklySchedule[1].guidance).toContain("Frekuensi lari mingguan TETAP");
  });

  it("generates 3-week taper plan for Race A when requested", () => {
    const plan = calculateTaperPlan({ raceDate: "2026-10-15", currentCtl: 60, currentTsb: -5, taperWeeks: 3 });
    expect(plan.weeklySchedule).toHaveLength(3);
    expect(plan.weeklySchedule[0].volumePct).toBe(75);
    expect(plan.weeklySchedule[1].volumePct).toBe(60);
    expect(plan.weeklySchedule[2].volumePct).toBe(40);
  });

  it("generates 4-6 day mini-taper plan for Race B with Subthreshold 4-day gap rule", () => {
    const plan = calculateTaperPlan({ raceDate: "2026-08-23", currentCtl: 55, currentTsb: -2, racePriority: "B" });
    expect(plan.racePriority).toBe("B");
    expect(plan.taperTypeDescription).toContain("B-Taper (Mini Taper 4–6 Hari)");
    expect(plan.targetFinishRpe).toContain("8–9 / 10");
    expect(plan.weeklySchedule).toHaveLength(1);
    expect(plan.weeklySchedule[0].volumePct).toBe(85);
    expect(plan.subthresholdGapRule).toContain("minimal 4 hari");
  });

  it("generates no-taper plan for Race C with workout swap and Joe Friel ego rule", () => {
    const plan = calculateTaperPlan({ raceDate: "2026-07-12", currentCtl: 50, currentTsb: 0, racePriority: "C" });
    expect(plan.racePriority).toBe("C");
    expect(plan.taperTypeDescription).toContain("C-Taper (No Taper / Workout Swap)");
    expect(plan.targetFinishRpe).toContain("6–7 / 10");
    expect(plan.weeklySchedule).toHaveLength(1);
    expect(plan.weeklySchedule[0].volumePct).toBe(100);
    expect(plan.weeklySchedule[0].guidance).toContain("Tukar 1 hari hard workout mingguan menjadi Easy Run");
    expect(plan.egoManagementRule).toContain("Joe Friel's Rule");
    expect(plan.egoManagementRule).toContain("Never let ego disrupt periodization");
  });
});
