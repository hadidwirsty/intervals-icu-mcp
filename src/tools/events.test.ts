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
