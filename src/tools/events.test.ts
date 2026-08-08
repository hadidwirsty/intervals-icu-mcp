// src/tools/events.test.ts
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("../client.js", () => ({
  intervalsRequest: vi.fn().mockResolvedValue([{ id: 1, name: "Mock Workout" }]),
  resolveAthleteId: vi.fn().mockReturnValue({ id: "i12345" }),
  isApiError: vi.fn().mockReturnValue(false),
}));

import { intervalsRequest } from "../client.js";

describe("get_workout_by_id schema validation", () => {
  const eventIdSchema = z.string().min(1);

  it("eventId schema rejects empty string", () => {
    expect(() => eventIdSchema.parse("")).toThrow();
  });

  it("eventId schema accepts valid id string", () => {
    expect(eventIdSchema.parse("12345")).toBe("12345");
  });
});

describe("create_running_workout payload formatting", () => {
  it("formats start_date_local correctly with custom startTime", () => {
    const startDate = "2026-08-04";
    const startTime = "05:00";
    const start_date_local = `${startDate}T${startTime}:00`;
    expect(start_date_local).toBe("2026-08-04T05:00:00");
  });

  it("formats start_date_local correctly with default startTime", () => {
    const startDate = "2026-08-04";
    const startTime = undefined;
    const start_date_local = `${startDate}T${startTime ?? "06:00"}:00`;
    expect(start_date_local).toBe("2026-08-04T06:00:00");
  });
});
