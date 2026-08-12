// src/utils/drift.test.ts
import { describe, expect, it } from "vitest";
import { analyzeCardiacDrift } from "./drift.js";

describe("analyzeCardiacDrift", () => {
  it("calculates minimal aerobic decoupling for steady stream", () => {
    const hr = Array(100).fill(150);
    const watts = Array(100).fill(250);
    const result = analyzeCardiacDrift({ heartrateStream: hr, powerOrSpeedStream: watts });
    expect(result.decouplingPct).toBeCloseTo(0, 1);
    expect(result.status).toBe("MINIMAL");
  });

  it("detects excessive cardiac drift when HR spikes in half 2", () => {
    const hr1 = Array(50).fill(140);
    const hr2 = Array(50).fill(160);
    const watts = Array(100).fill(200);
    const result = analyzeCardiacDrift({ heartrateStream: [...hr1, ...hr2], powerOrSpeedStream: watts });
    expect(result.decouplingPct).toBeGreaterThan(5);
    expect(result.status).toBe("EXCESSIVE");
  });

  it("throws error if streams are too short", () => {
    expect(() => analyzeCardiacDrift({ heartrateStream: [150], powerOrSpeedStream: [200] })).toThrow();
  });
});
