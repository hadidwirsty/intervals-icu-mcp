import { describe, expect, it } from "vitest";

import { validateWorkoutDsl } from "./dsl.js";
import { generateWeeklyPlan } from "./plan.js";

describe("generateWeeklyPlan", () => {
  const baseMonday = "2026-09-21";

  it("generates standard 7-day Norwegian Singles weekly plan (6.0h default)", () => {
    const plan = generateWeeklyPlan({ startDateMonday: baseMonday, targetHours: 6.0 });

    expect(plan.startDateMonday).toBe("2026-09-21");
    expect(plan.endDateSunday).toBe("2026-09-27");
    expect(plan.sessions).toHaveLength(7);

    // Monday - Rest
    const mon = plan.sessions[0]!;
    expect(mon.dayOfWeek).toBe("Monday");
    expect(mon.date).toBe("2026-09-21");
    expect(mon.category).toBe("REST");
    expect(mon.durationMinutes).toBe(0);
    expect(mon.workMinutes).toBe(0);
    expect(mon.description).toBeUndefined();

    // Tuesday - Quality 1
    const tue = plan.sessions[1]!;
    expect(tue.dayOfWeek).toBe("Tuesday");
    expect(tue.date).toBe("2026-09-22");
    expect(tue.category).toBe("WORKOUT");
    expect(tue.time).toBe("05:30");
    expect(tue.title).toContain("Short Sub-Threshold");
    expect(tue.workMinutes).toBe(30);
    expect(tue.durationMinutes).toBe(55);
    expect(() => validateWorkoutDsl(tue.description!)).not.toThrow();

    // Wednesday - Easy
    const wed = plan.sessions[2]!;
    expect(wed.dayOfWeek).toBe("Wednesday");
    expect(wed.date).toBe("2026-09-23");
    expect(wed.category).toBe("WORKOUT");
    expect(wed.time).toBe("05:30");
    expect(wed.durationMinutes).toBe(45);
    expect(() => validateWorkoutDsl(wed.description!)).not.toThrow();

    // Thursday - Easy Ngabuburit (fasting afternoon)
    const thu = plan.sessions[3]!;
    expect(thu.dayOfWeek).toBe("Thursday");
    expect(thu.date).toBe("2026-09-24");
    expect(thu.category).toBe("WORKOUT");
    expect(thu.time).toBe("16:45");
    expect(thu.title).toContain("Ngabuburit");
    expect(thu.durationMinutes).toBe(45);
    expect(() => validateWorkoutDsl(thu.description!)).not.toThrow();

    // Friday - Quality 2
    const fri = plan.sessions[4]!;
    expect(fri.dayOfWeek).toBe("Friday");
    expect(fri.date).toBe("2026-09-25");
    expect(fri.category).toBe("WORKOUT");
    expect(fri.time).toBe("05:30");
    expect(fri.title).toContain("Medium Sub-Threshold");
    expect(fri.workMinutes).toBe(30);
    expect(fri.durationMinutes).toBe(55);
    expect(() => validateWorkoutDsl(fri.description!)).not.toThrow();

    // Saturday - Shakeout + Strides
    const sat = plan.sessions[5]!;
    expect(sat.dayOfWeek).toBe("Saturday");
    expect(sat.date).toBe("2026-09-26");
    expect(sat.category).toBe("WORKOUT");
    expect(sat.time).toBe("05:30");
    expect(sat.title).toContain("Shakeout");
    expect(sat.durationMinutes).toBe(35);
    expect(() => validateWorkoutDsl(sat.description!)).not.toThrow();

    // Sunday - Pure Aerobic Long Run
    const sun = plan.sessions[6]!;
    expect(sun.dayOfWeek).toBe("Sunday");
    expect(sun.date).toBe("2026-09-27");
    expect(sun.category).toBe("WORKOUT");
    expect(sun.time).toBe("05:30");
    expect(sun.title).toContain("Pure Aerobic Long Run");
    expect(sun.durationMinutes).toBe(75);
    expect(() => validateWorkoutDsl(sun.description!)).not.toThrow();

    // NSA 75/25 Duration Rule Verification
    expect(plan.subThresholdWorkMinutes).toBe(60);
    expect(plan.totalRunningMinutes).toBe(310);
    expect(plan.subThresholdPercentage).toBeGreaterThanOrEqual(18);
    expect(plan.subThresholdPercentage).toBeLessThanOrEqual(25);
    expect(plan.guardrailCompliance.isCompliant).toBe(true);
  });

  it("supports flexible quality presets (e.g. 25x1m micro on Tuesday, 4x2000m distance on Friday)", () => {
    const plan = generateWeeklyPlan({
      startDateMonday: baseMonday,
      qualityPresets: {
        q1: "micro_1m",
        q2: "dist_2000m",
      },
    });

    const tue = plan.sessions[1]!;
    expect(tue.title).toContain("Micro Sub-Threshold");
    expect(tue.description).toContain("Intervals 25x");

    const fri = plan.sessions[4]!;
    expect(fri.title).toContain("Distance Sub-T 4x 2000m");
    expect(fri.description).toContain("2000m 92-95% power");
  });

  it("adjusts Thursday time to morning 05:30 if Thursday is NOT in fastingDays", () => {
    const plan = generateWeeklyPlan({
      startDateMonday: baseMonday,
      fastingDays: ["Monday"], // Kamis tidak puasa
    });

    const thu = plan.sessions[3]!;
    expect(thu.time).toBe("05:30");
    expect(thu.title).not.toContain("Ngabuburit");
  });

  it("supports beginner / low volume 2 quality sessions mode (§2.3)", () => {
    const plan = generateWeeklyPlan({
      startDateMonday: baseMonday,
      qualitySessionsCount: 2,
    });

    const fri = plan.sessions[4]!;
    expect(fri.category).toBe("WORKOUT");
    expect(fri.title).toContain("Easy");
    expect(fri.workMinutes).toBe(0);
    expect(plan.subThresholdWorkMinutes).toBe(30);
  });

  it("throws Error if startDateMonday is not a Monday or invalid date format", () => {
    expect(() => generateWeeklyPlan({ startDateMonday: "2026-09-22" })).toThrow(/Senin/);
    expect(() => generateWeeklyPlan({ startDateMonday: "invalid-date" })).toThrow();
  });
});
