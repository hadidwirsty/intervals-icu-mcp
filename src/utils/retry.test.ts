// src/utils/retry.test.ts
import { describe, expect, it } from "vitest";
import { calculateRetryDelay } from "./retry.js";

const JITTER_MAX = 200;
const BASE_DELAY = 1000;

describe("calculateRetryDelay", () => {
  it("attempt 0 → delay near 1000ms", () => {
    const delay = calculateRetryDelay(0);
    expect(delay).toBeGreaterThanOrEqual(BASE_DELAY);
    expect(delay).toBeLessThanOrEqual(BASE_DELAY + JITTER_MAX);
  });

  it("attempt 1 → delay near 2000ms", () => {
    const delay = calculateRetryDelay(1);
    expect(delay).toBeGreaterThanOrEqual(BASE_DELAY * 2);
    expect(delay).toBeLessThanOrEqual(BASE_DELAY * 2 + JITTER_MAX);
  });

  it("attempt 2 → delay near 4000ms", () => {
    const delay = calculateRetryDelay(2);
    expect(delay).toBeGreaterThanOrEqual(BASE_DELAY * 4);
    expect(delay).toBeLessThanOrEqual(BASE_DELAY * 4 + JITTER_MAX);
  });

  it("retryAfterSeconds overrides base delay", () => {
    const delay = calculateRetryDelay(0, 5);
    expect(delay).toBeGreaterThanOrEqual(5000);
    expect(delay).toBeLessThanOrEqual(5000 + JITTER_MAX);
  });
});
