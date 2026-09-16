// src/tools/calculator.test.ts
import { describe, expect, it } from "vitest";
import { parseRaceTime } from "./calculator.js";

describe("parseRaceTime", () => {
  it("parses MM:SS format", () => {
    expect(parseRaceTime("45:00")).toBe(2700);
  });

  it("parses HH:MM:SS format", () => {
    expect(parseRaceTime("1:30:00")).toBe(5400);
  });

  it("parses 20:30", () => {
    expect(parseRaceTime("20:30")).toBe(1230);
  });

  it("throws on invalid format", () => {
    expect(() => parseRaceTime("invalid")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseRaceTime("")).toThrow();
  });
});

describe("registerCalculatorTools", () => {
  it("registers calculator tools on McpServer successfully", async () => {
    const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
    const { registerCalculatorTools } = await import("./calculator.js");

    const server = new McpServer({ name: "test-server", version: "1.0.0" });
    expect(() => registerCalculatorTools(server)).not.toThrow();
  });
});
