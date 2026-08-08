// src/utils/cache.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryCache } from "./cache.js";

describe("InMemoryCache", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns cached value before TTL", () => {
    const cache = new InMemoryCache<string>();
    cache.set("key1", "value1", 5000);
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined after TTL expires", () => {
    const cache = new InMemoryCache<string>();
    cache.set("key1", "value1", 1000);
    vi.advanceTimersByTime(1001);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("has() returns false for expired entry", () => {
    const cache = new InMemoryCache<string>();
    cache.set("key1", "value1", 500);
    vi.advanceTimersByTime(501);
    expect(cache.has("key1")).toBe(false);
  });

  it("evicts oldest entry when max capacity reached", () => {
    const cache = new InMemoryCache<number>(3); // max 3
    cache.set("a", 1, 60_000);
    cache.set("b", 2, 60_000);
    cache.set("c", 3, 60_000);
    cache.set("d", 4, 60_000); // Triggers eviction of "a"
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("d")).toBe(4);
  });
});
