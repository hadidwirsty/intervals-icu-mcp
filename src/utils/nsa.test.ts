import { describe, expect, it } from "vitest";

import { calculateNsaMatrix } from "./nsa.js";

describe("calculateNsaMatrix", () => {
  it("generates all 6 Norwegian Singles time-based interval formats (§2.2) for baseline profile (VDOT 32, CP 293W)", () => {
    const result = calculateNsaMatrix({ vdot: 32, criticalPowerWatts: 293 });

    expect(result.vdot).toBe(32);
    expect(result.criticalPowerWatts).toBe(293);
    expect(result.intervals).toHaveLength(6);

    // 1 min
    const rep1m = result.intervals[0]!;
    expect(rep1m.duration).toBe("1 min");
    expect(rep1m.repetitions).toBe("25x");
    expect(rep1m.paceGuide).toBe("10k/CV pace");
    expect(rep1m.powerPercentageRange).toEqual({ min: 96, max: 99 });
    expect(rep1m.targetPowerWatts).toEqual({ min: 281, max: 290 });
    expect(rep1m.rest).toBe("30s walk");

    // 3 min
    const rep3m = result.intervals[1]!;
    expect(rep3m.duration).toBe("3 min");
    expect(rep3m.repetitions).toBe("10-12x");
    expect(rep3m.paceGuide).toBe("15k pace");
    expect(rep3m.powerPercentageRange).toEqual({ min: 94, max: 96 });
    expect(rep3m.targetPowerWatts).toEqual({ min: 275, max: 281 });
    expect(rep3m.rest).toBe("60s walk");

    // 5-6 min
    const rep5m = result.intervals[2]!;
    expect(rep5m.duration).toBe("5-6 min");
    expect(rep5m.repetitions).toBe("6-8x");
    expect(rep5m.paceGuide).toBe("15k pace");
    expect(rep5m.powerPercentageRange).toEqual({ min: 92, max: 95 });
    expect(rep5m.targetPowerWatts).toEqual({ min: 270, max: 278 });
    expect(rep5m.rest).toBe("60s walk");

    // 6-8 min
    const rep6m = result.intervals[3]!;
    expect(rep6m.duration).toBe("6-8 min");
    expect(rep6m.repetitions).toBe("5-6x");
    expect(rep6m.paceGuide).toBe("Half marathon pace");
    expect(rep6m.powerPercentageRange).toEqual({ min: 92, max: 95 });
    expect(rep6m.targetPowerWatts).toEqual({ min: 270, max: 278 });
    expect(rep6m.rest).toBe("60s walk");

    // 10-12 min
    const rep10m = result.intervals[4]!;
    expect(rep10m.duration).toBe("10-12 min");
    expect(rep10m.repetitions).toBe("3-4x");
    expect(rep10m.paceGuide).toBe("HM - 30k pace");
    expect(rep10m.powerPercentageRange).toEqual({ min: 89, max: 92 });
    expect(rep10m.targetPowerWatts).toEqual({ min: 261, max: 270 });
    expect(rep10m.rest).toBe("60-120s walk");
    expect(rep10m.notes).toContain("85–88% CP");

    // 15 min
    const rep15m = result.intervals[5]!;
    expect(rep15m.duration).toBe("15 min");
    expect(rep15m.repetitions).toBe("3-4x");
    expect(rep15m.paceGuide).toBe("30k pace");
    expect(rep15m.powerPercentageRange).toEqual({ min: 85, max: 88 });
    expect(rep15m.targetPowerWatts).toEqual({ min: 249, max: 258 });
    expect(rep15m.rest).toBe("90-120s walk");

    // Progression of paces: 10k pace is faster than HM pace and 30k pace
    expect(rep1m.targetPaceSeconds).toBeLessThan(rep6m.targetPaceSeconds);
    expect(rep6m.targetPaceSeconds).toBeLessThan(rep15m.targetPaceSeconds);

    // Physiological notes present
    expect(result.physiologicalNotes.length).toBeGreaterThanOrEqual(2);
  });

  it("calculates accurate target power for calibrated athlete profile (VDOT 31, CP 295W)", () => {
    const result = calculateNsaMatrix({ vdot: 31, criticalPowerWatts: 295 });

    expect(result.vdot).toBe(31);
    expect(result.criticalPowerWatts).toBe(295);

    // 3 min (Card A)
    const rep3m = result.intervals[1]!;
    expect(rep3m.targetPowerWatts).toEqual({ min: 277, max: 283 });
    expect(rep3m.rest).toBe("60s walk");

    // 5-6 min (Card B)
    const rep5m = result.intervals[2]!;
    expect(rep5m.targetPowerWatts).toEqual({ min: 271, max: 280 });

    // 10-12 min (Card C)
    const rep10m = result.intervals[4]!;
    expect(rep10m.targetPowerWatts).toEqual({ min: 263, max: 271 });
  });

  it("throws RangeError for invalid VDOT (< 30 or > 85)", () => {
    expect(() => calculateNsaMatrix({ vdot: 25, criticalPowerWatts: 293 })).toThrow(RangeError);
    expect(() => calculateNsaMatrix({ vdot: 90, criticalPowerWatts: 293 })).toThrow(RangeError);
  });

  it("throws RangeError for invalid critical power (<= 0)", () => {
    expect(() => calculateNsaMatrix({ vdot: 35, criticalPowerWatts: 0 })).toThrow(RangeError);
    expect(() => calculateNsaMatrix({ vdot: 35, criticalPowerWatts: -100 })).toThrow(RangeError);
  });
});
