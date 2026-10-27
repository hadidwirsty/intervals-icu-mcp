// src/utils/readiness.test.ts
import { describe, expect, it } from "vitest";
import { calculateReadinessScore, calculateRhrBaseline } from "./readiness.js";

describe("calculateReadinessScore", () => {
  it("calculates GREEN score for optimal TSB and ACWR", () => {
    const result = calculateReadinessScore({ tsb: 15, acwr: 1.0, sleepScore: 85 });
    expect(result.readinessScore).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe("GREEN");
  });

  it("calculates RED score for overstressed TSB and ACWR danger", () => {
    const result = calculateReadinessScore({ tsb: -35, acwr: 1.6, sleepScore: 50 });
    expect(result.readinessScore).toBeLessThan(50);
    expect(result.status).toBe("RED");
  });

  it("incorporates Garmin Body Battery and penalizes UNBALANCED or LOW HRV", () => {
    // Prima with high Body Battery and balanced HRV
    const optimal = calculateReadinessScore({
      tsb: 15,
      acwr: 1.0,
      sleepScore: 85,
      bodyBattery: 90,
      hrvStatus: "BALANCED",
    });
    expect(optimal.status).toBe("GREEN");
    expect(optimal.readinessScore).toBeGreaterThanOrEqual(80);

    // Drained Body Battery caps score even if TSB looks fresh
    const drained = calculateReadinessScore({
      tsb: 20,
      acwr: 1.0,
      sleepScore: 40,
      bodyBattery: 25,
      hrvStatus: "LOW",
    });
    expect(drained.status).not.toBe("GREEN");
    expect(drained.readinessScore).toBeLessThan(75);
  });
});

describe("calculateRhrBaseline", () => {
  it("calculates 7-day, 28-day, and 1-year averages with baseline range [low, high]", () => {
    const history: number[] = [];
    for (let i = 0; i < 337; i++) {
      history.push(46 + (i % 3) - 1); // 45, 46, 47 -> avg ~46
    }
    for (let i = 0; i < 28; i++) {
      history.push(48 + (i % 3) - 1); // 47, 48, 49 -> avg ~48
    }

    const baseline = calculateRhrBaseline(history, 48);
    expect(baseline).not.toBeNull();
    if (baseline) {
      expect(baseline.avg7d).toBeCloseTo(48, 0);
      expect(baseline.avg28d).toBeCloseTo(48, 0);
      expect(baseline.avg1y).toBeDefined();
      expect(baseline.avg1y!).toBeLessThan(baseline.avg28d!);
      expect(baseline.low).toBeLessThanOrEqual(47);
      expect(baseline.high).toBeGreaterThanOrEqual(49);
      expect(baseline.status).toBe("BALANCED");
    }
  });

  it("detects ELEVATED and SPIKE_RED_FLAG when today's RHR spikes", () => {
    const history = Array(28).fill(48); // stable 48 bpm
    const elevated = calculateRhrBaseline(history, 51);
    expect(elevated?.status).toBe("ELEVATED");

    const spike = calculateRhrBaseline(history, 54); // +6 bpm above 48
    expect(spike?.status).toBe("SPIKE_RED_FLAG");

    const suppressed = calculateRhrBaseline(history, 40); // -8 bpm below 48
    expect(suppressed?.status).toBe("SUPPRESSED");
  });

  it("handles object array input from Intervals.icu wellness data", () => {
    const records = [
      { restingHR: 48 },
      { restingHR: 49 },
      { restingHR: 47 },
      { restingHR: 48 },
      { restingHR: null },
      { restingHR: 50 },
      { restingHR: 48 },
      { restingHR: 48 },
    ];
    const result = calculateRhrBaseline(records, 49);
    expect(result).not.toBeNull();
    expect(result?.avg7d).toBeGreaterThanOrEqual(47);
    expect(result?.status).toBe("BALANCED");
  });
});

describe("calculateReadinessScore with dynamic RHR baseline", () => {
  it("does not penalize RHR when within normal baseline range", () => {
    const result = calculateReadinessScore({
      tsb: 15,
      acwr: 1.0,
      sleepScore: 85,
      restingHr: 49,
      rhrBaseline: {
        low: 46,
        high: 51,
        avg7d: 48,
        avg28d: 48.5,
      },
    });
    expect(result.status).toBe("GREEN");
    expect(result.readinessScore).toBeGreaterThanOrEqual(80);
  });

  it("penalizes heavily (-30) on SPIKE_RED_FLAG (> 5 bpm above baseline)", () => {
    const result = calculateReadinessScore({
      tsb: 15,
      acwr: 1.0,
      sleepScore: 85,
      restingHr: 55, // 55 - 48 = 7 bpm spike!
      rhrBaseline: {
        low: 46,
        high: 51,
        avg7d: 48,
        avg28d: 48.5,
      },
    });
    expect(result.readinessScore).toBeLessThan(80);
    expect(result.status).not.toBe("GREEN");
  });
});

