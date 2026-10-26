// src/utils/readiness.test.ts
import { describe, expect, it } from "vitest";
import { calculateReadinessScore } from "./readiness.js";

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
