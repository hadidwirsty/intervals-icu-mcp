#!/usr/bin/env node
/**
 * Intervals.icu MCP Server
 *
 * Mengekspos data & aksi Intervals.icu (activities, wellness, calendar/events,
 * gear, power curves, custom items) sebagai MCP tools lewat stdio transport.
 *
 * Auth: butuh INTERVALS_API_KEY (Settings > Developer di intervals.icu).
 * Athlete default: INTERVALS_ATHLETE_ID (opsional, bisa dioverride per-call).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerActivityTools } from "./tools/activities.js";
import { registerAthleteTools } from "./tools/athlete.js";
import { registerCalculatorTools } from "./tools/calculator.js";
import { registerCustomItemTools } from "./tools/customItems.js";
import { registerEventTools } from "./tools/events.js";
import { registerGearTools } from "./tools/gear.js";
import { registerLoadTools } from "./tools/load.js";
import { registerPowerCurveTools } from "./tools/powerCurves.js";
import { registerWellnessTools } from "./tools/wellness.js";

const server = new McpServer({
  name: "intervals-icu-mcp",
  version: "0.1.0",
});

registerActivityTools(server);
registerAthleteTools(server);
registerCalculatorTools(server);
registerWellnessTools(server);
registerEventTools(server);
registerGearTools(server);
registerLoadTools(server);
registerPowerCurveTools(server);
registerCustomItemTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[intervals-icu-mcp] Server berjalan lewat stdio.");
}

main().catch((err: unknown) => {
  console.error("[intervals-icu-mcp] Fatal error:", err);
  process.exit(1);
});
