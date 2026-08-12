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
});
