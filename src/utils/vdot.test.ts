// src/utils/vdot.test.ts
import { describe, expect, it } from "vitest";
import { calculatePaceZones, calculateVdot, secondsToMMSS } from "./vdot.js";

describe("calculateVdot", () => {
  it("10K in 45:00 → VDOT ≈ 44-45", () => {
    const vdot = calculateVdot(10_000, 45 * 60);
    expect(vdot).toBeGreaterThanOrEqual(43);
    expect(vdot).toBeLessThanOrEqual(46);
  });

  it("5K in 20:00 → VDOT ≈ 49", () => {
    const vdot = calculateVdot(5_000, 20 * 60);
    expect(vdot).toBeGreaterThanOrEqual(48);
    expect(vdot).toBeLessThanOrEqual(50);
  });

  it("Marathon in 3:30:00 → VDOT ≈ 44", () => {
    const vdot = calculateVdot(42_195, 3 * 3600 + 30 * 60);
    expect(vdot).toBeGreaterThanOrEqual(43);
    expect(vdot).toBeLessThanOrEqual(46);
  });

  it("throws RangeError for zero time", () => {
    expect(() => calculateVdot(10_000, 0)).toThrow(RangeError);
  });

  it("throws RangeError for negative distance", () => {
    expect(() => calculateVdot(-100, 300)).toThrow(RangeError);
  });
});

describe("secondsToMMSS", () => {
  it("converts 240 seconds to '4:00'", () => {
    expect(secondsToMMSS(240)).toBe("4:00");
  });

  it("converts 315 seconds to '5:15'", () => {
    expect(secondsToMMSS(315)).toBe("5:15");
  });
});

describe("calculatePaceZones", () => {
  it("VDOT 50 threshold pace min is around 4:00/km", () => {
    const zones = calculatePaceZones(50);
    const [tMinM, tMinS] = zones.threshold.min.split(":").map(Number);
    const tMinTotalSec = (tMinM ?? 0) * 60 + (tMinS ?? 0);
    expect(tMinTotalSec).toBeGreaterThanOrEqual(220); // 3:40
    expect(tMinTotalSec).toBeLessThanOrEqual(270);    // 4:30
  });

  it("easy pace is slower than threshold pace for VDOT 44", () => {
    const zones = calculatePaceZones(44);
    const [eM, eS] = zones.easy.min.split(":").map(Number);
    const [tM, tS] = zones.threshold.min.split(":").map(Number);
    const easySeconds = (eM ?? 0) * 60 + (eS ?? 0);
    const thresholdSeconds = (tM ?? 0) * 60 + (tS ?? 0);
    expect(easySeconds).toBeGreaterThan(thresholdSeconds);
  });

  it("throws RangeError for VDOT < 30", () => {
    expect(() => calculatePaceZones(29)).toThrow(RangeError);
  });

  it("throws RangeError for VDOT > 85", () => {
    expect(() => calculatePaceZones(86)).toThrow(RangeError);
  });
});
