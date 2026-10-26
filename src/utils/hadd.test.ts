import { describe, expect, it } from "vitest";

import {
  calculateHaddZones,
  calculateUphillAthlete10PctRule,
  diagnoseAerobicBase,
  estimateAerobicThresholdProxy,
  formatSecondsToTime,
} from "./hadd.js";

describe("formatSecondsToTime", () => {
  it("formats seconds into MM:SS correctly", () => {
    expect(formatSecondsToTime(125)).toBe("02:05");
    expect(formatSecondsToTime(300)).toBe("05:00");
  });

  it("formats seconds into H:MM:SS correctly", () => {
    expect(formatSecondsToTime(3665)).toBe("1:01:05");
    expect(formatSecondsToTime(7200)).toBe("2:00:00");
  });

  it("handles edge cases gracefully", () => {
    expect(formatSecondsToTime(0)).toBe("00:00");
    expect(formatSecondsToTime(-10)).toBe("00:00");
    expect(formatSecondsToTime(NaN)).toBe("00:00");
  });
});

describe("diagnoseAerobicBase (Horwill's Rule)", () => {
  it("diagnoses an aerobically mature runner (+10 s/km per doubling)", () => {
    // 5 km in 20:00 (pace 4:00/km = 240 s/km)
    // 10 km in 41:40 (pace 4:10/km = 250 s/km -> tepat +10 s/km per 1 doubling)
    const result = diagnoseAerobicBase({
      shorterRace: { distanceKm: 5, timeSeconds: 1200, name: "5K Baseline" },
      longerRace: { distanceKm: 10, timeSeconds: 2500, name: "10K Test" },
      targetRaceDistanceKm: 21.0975,
    });

    expect(result.doublings).toBe(1);
    expect(result.actualPaceDropPerDoublingSec).toBe(10);
    expect(result.gapPerDoublingSec).toBe(0);
    expect(result.status).toBe("AEROBICALLY_MATURE");
    expect(result.targetProjection).toBeDefined();
    expect(result.targetProjection?.targetDistanceKm).toBe(21.0975);
  });

  it("diagnoses an aerobically deficient runner (Slide 3 Older Runner: 5k 3:24 -> 10k 3:41)", () => {
    // 5 km in 17:00 (pace 3:24/km = 204 s/km)
    // 10 km in 36:50 (pace 3:41/km = 221 s/km -> drop 17 s/km per doubling)
    const result = diagnoseAerobicBase({
      shorterRace: { distanceKm: 5, timeSeconds: 1020, name: "5K Race" },
      longerRace: { distanceKm: 10, timeSeconds: 2210, name: "10K Race" },
    });

    expect(result.doublings).toBe(1);
    expect(result.actualPaceDropPerDoublingSec).toBe(17);
    expect(result.gapPerDoublingSec).toBe(7);
    expect(result.status).toBe("SEVERELY_DEFICIENT");
    expect(result.tacticalRecommendations.length).toBeGreaterThan(0);
  });

  it("diagnoses a developing runner (+11 s/km per doubling)", () => {
    // 5 km in 25:00 (300 s/km)
    // 10 km in 51:50 (311 s/km -> drop 11 s/km)
    const result = diagnoseAerobicBase({
      shorterRace: { distanceKm: 5, timeSeconds: 1500 },
      longerRace: { distanceKm: 10, timeSeconds: 3110 },
    });

    expect(result.status).toBe("DEVELOPING");
    expect(result.actualPaceDropPerDoublingSec).toBe(11);
  });

  it("throws an error if inputs are invalid", () => {
    expect(() =>
      diagnoseAerobicBase({
        shorterRace: { distanceKm: 10, timeSeconds: 3000 },
        longerRace: { distanceKm: 5, timeSeconds: 1500 },
      })
    ).toThrow("Jarak shorterRace harus lebih pendek");

    expect(() =>
      diagnoseAerobicBase({
        shorterRace: { distanceKm: -5, timeSeconds: 1000 },
        longerRace: { distanceKm: 10, timeSeconds: 2000 },
      })
    ).toThrow("harus bernilai positif");
  });
});

describe("calculateHaddZones", () => {
  it("calculates accurate Hadd zones for high HRmax (207 bpm)", () => {
    const zones = calculateHaddZones({ hrMax: 207 });

    expect(zones.hrMax).toBe(207);
    // Easy ceiling: HRmax - 50 = 157 bpm
    expect(zones.zones.easyRunning.maxHrBpm).toBe(157);
    // Start Threshold target: HRmax - 35 = 172 bpm
    expect(zones.zones.startThreshold.targetHrBpm).toBe(172);
    // Marathon HR: 177 - 182 bpm
    expect(zones.zones.marathonHr.minHrBpm).toBe(177);
    expect(zones.zones.marathonHr.maxHrBpm).toBe(182);

    // Step Test stages
    expect(zones.stepTest2400mProtocol.stages.length).toBe(5);
    expect(zones.operationalRules.progressRule).toContain("+5 bpm");
  });

  it("calculates accurate Hadd zones for standard HRmax (183 bpm)", () => {
    const zones = calculateHaddZones({ hrMax: 183 });

    expect(zones.zones.easyRunning.maxHrBpm).toBe(133);
    expect(zones.zones.startThreshold.targetHrBpm).toBe(148);
    expect(zones.stepTest2400mProtocol.stages[0]?.targetHrBpm).toBe(125);
  });

  it("throws error for out-of-range HRmax", () => {
    expect(() => calculateHaddZones({ hrMax: 120 })).toThrow("HRmax tidak realistis");
    expect(() => calculateHaddZones({ hrMax: 250 })).toThrow("HRmax tidak realistis");
  });
});

describe("calculateUphillAthlete10PctRule", () => {
  it("diagnoses a healthy aerobic base (OPTIMAL) when gap is <= 10%", () => {
    // Calibrated target: AnT 188 bpm, AeT 172 bpm -> Gap 16 bpm = (16/188)*100% = 8.5%
    const result = calculateUphillAthlete10PctRule(172, 188);

    expect(result.aerobicThresholdHr).toBe(172);
    expect(result.anaerobicThresholdHr).toBe(188);
    expect(result.gapBpm).toBe(16);
    expect(result.gapPct).toBe(8.5);
    expect(result.hasAerobicDeficiencySyndrome).toBe(false);
    expect(result.severityLevel).toBe("OPTIMAL");
    expect(result.diagnosisStatus).toBe("WELL_DEVELOPED_AEROBIC_ENGINE");
    expect(result.diagnosisDescription).toContain("Mesin aerobik prima");
  });

  it("diagnoses MILD aerobic lag when gap is 10.1% - 13.0%", () => {
    // AnT 188, AeT 165 -> Gap 23 bpm = 12.2%
    const result = calculateUphillAthlete10PctRule(165, 188);

    expect(result.severityLevel).toBe("MILD");
    expect(result.hasAerobicDeficiencySyndrome).toBe(true);
    expect(result.subThresholdGuidance).toContain("format repetisi pendek");
  });

  it("diagnoses MODERATE ADS when gap is 13.1% - 18.0%", () => {
    // Runner with broken floor: AnT 188 bpm, AeT 158 bpm -> Gap 30 bpm = 16.0%
    const result = calculateUphillAthlete10PctRule(158, 188);

    expect(result.gapBpm).toBe(30);
    expect(result.gapPct).toBe(16);
    expect(result.hasAerobicDeficiencySyndrome).toBe(true);
    expect(result.severityLevel).toBe("MODERATE");
    expect(result.diagnosisStatus).toBe("AEROBIC_DEFICIENCY_SYNDROME");
    expect(result.subThresholdGuidance).toContain("Tangguhkan sesi tempo panjang");
  });

  it("diagnoses SEVERE ADS when gap is > 18.0%", () => {
    // Runner with severe broken floor: AnT 188 bpm, AeT 145 bpm -> Gap 43 bpm = 22.9%
    const result = calculateUphillAthlete10PctRule(145, 188);

    expect(result.severityLevel).toBe("SEVERE");
    expect(result.hasAerobicDeficiencySyndrome).toBe(true);
    expect(result.subThresholdGuidance).toContain("Lantai rusak parah");
  });

  it("handles exact 10.0% boundary gracefully", () => {
    // AnT 190, AeT 171 -> Gap 19 = 10.0%
    const result = calculateUphillAthlete10PctRule(171, 190);

    expect(result.gapPct).toBe(10);
    expect(result.hasAerobicDeficiencySyndrome).toBe(false);
    expect(result.severityLevel).toBe("OPTIMAL");
  });

  it("throws error for invalid AeT and AnT inputs", () => {
    expect(() => calculateUphillAthlete10PctRule(188, 172)).toThrow("harus lebih rendah");
    expect(() => calculateUphillAthlete10PctRule(180, 180)).toThrow("harus lebih rendah");
    expect(() => calculateUphillAthlete10PctRule(-10, 180)).toThrow("harus bernilai positif");
    expect(() => calculateUphillAthlete10PctRule(150, 0)).toThrow("harus bernilai positif");
  });
});

describe("estimateAerobicThresholdProxy", () => {
  it("calculates accurate proxy values for calibrated athlete (HRmax 207, LTHR 188)", () => {
    const res = estimateAerobicThresholdProxy({ hrMax: 207, lthr: 188, restingHr: 46 });

    expect(res.hrMax).toBe(207);
    expect(res.haddCeilingBpm).toBe(157); // 207 - 50
    expect(res.targetAeTFor10PctRuleBpm).toBe(169); // 188 * 0.90
    expect(res.estimatedAeTRangeBpm.minBpm).toBe(149); // 207 * 0.72
    expect(res.estimatedAeTRangeBpm.maxBpm).toBe(157); // min(207 * 0.76 = 157.3, 157)
    expect(res.fieldTestProtocolRecommendations.length).toBeGreaterThan(0);
  });

  it("throws error for unrealistic HRmax", () => {
    expect(() => estimateAerobicThresholdProxy({ hrMax: 120 })).toThrow("HRmax tidak realistis");
    expect(() => estimateAerobicThresholdProxy({ hrMax: 250 })).toThrow("HRmax tidak realistis");
  });
});

describe("diagnoseAerobicBase with Uphill Athlete 10% Rule integration", () => {
  it("includes MILD ADS warning in tacticalRecommendations when gap is 12.2%", () => {
    const result = diagnoseAerobicBase({
      shorterRace: { distanceKm: 5, timeSeconds: 1200 },
      longerRace: { distanceKm: 10, timeSeconds: 2500 },
      aerobicThresholdHr: 165,
      anaerobicThresholdHr: 188,
    });

    expect(result.uphillAthleteRule).toBeDefined();
    expect(result.uphillAthleteRule?.severityLevel).toBe("MILD");
    expect(result.tacticalRecommendations.some((r) => r.includes("PERINGATAN ADS RINGAN"))).toBe(true);
  });

  it("includes SEVERE ADS warning in tacticalRecommendations when gap > 18%", () => {
    const result = diagnoseAerobicBase({
      shorterRace: { distanceKm: 5, timeSeconds: 1200 },
      longerRace: { distanceKm: 10, timeSeconds: 2500 },
      aerobicThresholdHr: 145,
      anaerobicThresholdHr: 188,
    });

    expect(result.uphillAthleteRule?.severityLevel).toBe("SEVERE");
    expect(result.tacticalRecommendations.some((r) => r.includes("PERINGATAN ADS BERAT"))).toBe(true);
  });

  it("includes positive endorsement when gap <= 10%", () => {
    const result = diagnoseAerobicBase({
      shorterRace: { distanceKm: 5, timeSeconds: 1200 },
      longerRace: { distanceKm: 10, timeSeconds: 2500 },
      aerobicThresholdHr: 172,
      anaerobicThresholdHr: 188,
    });

    expect(result.uphillAthleteRule).toBeDefined();
    expect(result.uphillAthleteRule?.hasAerobicDeficiencySyndrome).toBe(false);
    expect(result.tacticalRecommendations.some((r) => r.includes("Uphill Athlete 10% Rule: Prima"))).toBe(true);
  });
});
