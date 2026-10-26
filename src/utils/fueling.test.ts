import { describe, expect, it } from "vitest";

import { calculateRaceFuelingPlan, EJ_SPORT_GEL } from "./fueling.js";

describe("calculateRaceFuelingPlan", () => {
  it("calculates comprehensive Half Marathon fueling plan using standard dual-source gel for calibrated athlete (CP 295W, VDOT 31)", () => {
    const plan = calculateRaceFuelingPlan({
      raceDistanceKm: 21.0975,
      predictedTimeMinutes: 138, // ~2 jam 18 menit
      athleteWeightKg: 81,
      temperatureCelsius: 26,
      relativeHumidityPct: 80,
      criticalPowerWatts: 295,
      vdot: 31,
    });

    expect(plan.raceDistanceKm).toBe(21.0975);
    expect(plan.predictedTimeMinutes).toBe(138);
    expect(plan.predictedTimeFormatted).toBe("2h18m00s");

    // EJ Sport Nutritional Verification (30g per sachet: 12g maltodextrin + 18g dextrose)
    expect(plan.gelBrand).toBe("EJ Sport");
    expect(plan.gelCount).toBe(4);
    expect(plan.totalCarbsPlannedGrams).toBe(120); // 4 x 30g
    expect(plan.hourlyCarbsTargetGrams).toBeGreaterThanOrEqual(45);
    expect(plan.hourlyCarbsTargetGrams).toBeLessThanOrEqual(55);

    // Sweat rate and hydration for 70-80kg in 26°C tropical climate
    expect(plan.estimatedSweatRateMlPerHour).toBeGreaterThanOrEqual(800);
    expect(plan.estimatedSweatRateMlPerHour).toBeLessThanOrEqual(1050);
    expect(plan.targetFluidIntakeMlPerHour).toBeGreaterThanOrEqual(500);
    expect(plan.targetFluidIntakeMlPerHour).toBeLessThanOrEqual(700);
    expect(plan.targetSodiumMgPerHour).toBeGreaterThanOrEqual(350);
    expect(plan.targetSodiumMgPerHour).toBeLessThanOrEqual(500);

    // 4 Milestones Timing
    expect(plan.fuelingSchedule).toHaveLength(4);

    const m0 = plan.fuelingSchedule[0]!;
    expect(m0.timing).toBe("T-15m");
    expect(m0.carbsGrams).toBe(30);
    expect(m0.action).toContain("EJ Sport");
    expect(m0.fluidMl).toBe(150);

    const m1 = plan.fuelingSchedule[1]!;
    expect(m1.timing).toContain("KM 6");
    expect(m1.distanceKm).toBe(6);
    expect(m1.carbsGrams).toBe(30);

    const m2 = plan.fuelingSchedule[2]!;
    expect(m2.timing).toContain("KM 12");
    expect(m2.distanceKm).toBe(12);
    expect(m2.carbsGrams).toBe(30);

    const m3 = plan.fuelingSchedule[3]!;
    expect(m3.timing).toContain("KM 17");
    expect(m3.distanceKm).toBe(17);
    expect(m3.carbsGrams).toBe(30);

    // 3 Tactical Pacing Segments (CP 295W)
    expect(plan.pacingStrategy).toHaveLength(3);

    const s1 = plan.pacingStrategy[0]!;
    expect(s1.segment).toBe("KM 1 - 3");
    expect(s1.title).toContain("Calm Adrenaline Guard");
    expect(s1.powerWattsRange.max).toBeLessThanOrEqual(268);

    const s2 = plan.pacingStrategy[1]!;
    expect(s2.segment).toBe("KM 4 - 17");
    expect(s2.title).toContain("Sub-Threshold Cruise Control");
    expect(s2.powerWattsRange.min).toBeGreaterThanOrEqual(265);
    expect(s2.powerWattsRange.max).toBeLessThanOrEqual(278);

    const s3 = plan.pacingStrategy[2]!;
    expect(s3.segment).toBe("KM 18 - 21.1");
    expect(s3.title).toContain("Empty the Tank Finish");
    expect(s3.powerWattsRange.min).toBeGreaterThanOrEqual(275);
    expect(s3.powerWattsRange.max).toBeLessThanOrEqual(288);

    // Climate Context
    expect(plan.climateContext.heatRisk).toBe("HIGH");
    expect(plan.climateContext.notes.length).toBeGreaterThanOrEqual(2);
  });

  it("exports EJ_SPORT_GEL with exact official composition (12g maltodextrin, 18g dextrose, 30g carbs)", () => {
    expect(EJ_SPORT_GEL.name).toBe("EJ Sport");
    expect(EJ_SPORT_GEL.carbsGrams).toBe(30);
    expect(EJ_SPORT_GEL.maltodextrinGrams).toBe(12);
    expect(EJ_SPORT_GEL.dextroseGrams).toBe(18);
    expect(EJ_SPORT_GEL.details).toContain("L-Carnitine");
    expect(EJ_SPORT_GEL.details).toContain("Vitamin B");
  });

  it("throws Error for non-positive distance or weight", () => {
    expect(() => calculateRaceFuelingPlan({ raceDistanceKm: 0 })).toThrow();
    expect(() => calculateRaceFuelingPlan({ athleteWeightKg: -10 })).toThrow();
  });

  it("calculates dedicated 10K road race fueling & pacing plan (2 gels, 60g carbs, 3 pacing segments)", () => {
    const plan = calculateRaceFuelingPlan({
      raceDistanceKm: 10,
      predictedTimeMinutes: 59,
      athleteWeightKg: 81,
      criticalPowerWatts: 295,
    });

    expect(plan.raceName).toBe("10K Race");
    expect(plan.raceDistanceKm).toBe(10);
    expect(plan.predictedTimeMinutes).toBe(59);
    expect(plan.gelCount).toBe(2);
    expect(plan.totalCarbsPlannedGrams).toBe(60); // 2 x 30g
    expect(plan.fuelingSchedule).toHaveLength(2);

    expect(plan.fuelingSchedule[0]!.timing).toBe("T-15m");
    expect(plan.fuelingSchedule[0]!.carbsGrams).toBe(30);

    expect(plan.fuelingSchedule[1]!.timing).toContain("KM 5");
    expect(plan.fuelingSchedule[1]!.carbsGrams).toBe(30);

    // 3 segments for 10K
    expect(plan.pacingStrategy).toHaveLength(3);
    expect(plan.pacingStrategy[0]!.segment).toBe("KM 1 - 2");
    expect(plan.pacingStrategy[0]!.title).toContain("Calm Adrenaline Guard");

    expect(plan.pacingStrategy[1]!.segment).toBe("KM 3 - 8");
    expect(plan.pacingStrategy[1]!.title).toContain("Sub-60 Target Rhythm");

    expect(plan.pacingStrategy[2]!.segment).toBe("KM 9 - 10");
    expect(plan.pacingStrategy[2]!.title).toContain("Negative Split Finish Kick");
  });

  it("calculates 5K race fueling with single pre-race gel", () => {
    const plan = calculateRaceFuelingPlan({
      raceDistanceKm: 5,
    });

    expect(plan.raceName).toBe("5K Race");
    expect(plan.gelCount).toBe(1);
    expect(plan.totalCarbsPlannedGrams).toBe(30);
    expect(plan.fuelingSchedule).toHaveLength(1);
    expect(plan.pacingStrategy).toHaveLength(3);
  });
});
