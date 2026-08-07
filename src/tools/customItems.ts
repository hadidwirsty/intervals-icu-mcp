/**
 * Tools untuk custom items (custom chart, field, zones, dll) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const ITEM_TYPES = [
  "FITNESS_CHART",
  "TRACE_CHART",
  "INPUT_FIELD",
  "ACTIVITY_FIELD",
  "INTERVAL_FIELD",
  "ACTIVITY_STREAM",
  "ACTIVITY_CHART",
  "ACTIVITY_HISTOGRAM",
  "ACTIVITY_HEATMAP",
  "ACTIVITY_MAP",
  "ACTIVITY_PANEL",
  "ZONES",
] as const;

const VISIBILITY = ["PRIVATE", "FOLLOWERS", "PUBLIC"] as const;

export function registerCustomItemTools(server: McpServer): void {
  server.registerTool(
    "get_custom_items",
    {
      title: "Get Custom Items",
      description: "Ambil daftar custom item (custom chart, field, zones, dll) milik seorang athlete.",
      inputSchema: {
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/custom-item`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_custom_item_by_id",
    {
      title: "Get Custom Item By ID",
      description: "Ambil detail satu custom item berdasarkan ID.",
      inputSchema: {
        itemId: z.number().int().describe("ID custom item."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ itemId, athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/custom-item/${itemId}`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "create_custom_item",
    {
      title: "Create Custom Item",
      description:
        "Buat custom item baru (chart/field/zones) untuk seorang athlete. Catatan enum penting: field 'type' di dalam content untuk INPUT_FIELD/ACTIVITY_FIELD harus 'numeric' | 'text' | 'select' (bukan 'number'); field 'aggregate' harus MIN|SUM|MAX|AVERAGE (bukan AVG).",
      inputSchema: {
        name: z.string().describe("Nama custom item."),
        itemType: z.enum(ITEM_TYPES).describe("Tipe custom item."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        description: z.string().optional().describe("Deskripsi custom item."),
        content: z.record(z.string(), z.unknown()).optional().describe("Konfigurasi konten custom item (object)."),
        visibility: z.enum(VISIBILITY).optional().describe("Visibilitas: PRIVATE, FOLLOWERS, atau PUBLIC."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ name, itemType, athleteId, description, content, visibility, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const body: Record<string, unknown> = { name, type: itemType };
      if (description !== undefined) body.description = description;
      if (content !== undefined) body.content = content;
      if (visibility !== undefined) body.visibility = visibility;

      const result = await intervalsRequest(`/athlete/${id}/custom-item`, {
        method: "POST",
        body,
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "update_custom_item",
    {
      title: "Update Custom Item",
      description: "Update custom item yang sudah ada. Hanya field yang diisi yang akan dikirim.",
      inputSchema: {
        itemId: z.number().int().describe("ID custom item yang diupdate."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        name: z.string().optional().describe("Nama baru."),
        itemType: z.enum(ITEM_TYPES).optional().describe("Tipe baru."),
        description: z.string().optional().describe("Deskripsi baru."),
        content: z.record(z.string(), z.unknown()).optional().describe("Konten baru (object)."),
        visibility: z.enum(VISIBILITY).optional().describe("Visibilitas baru."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ itemId, athleteId, name, itemType, description, content, visibility, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const body: Record<string, unknown> = {};
      if (name !== undefined) body.name = name;
      if (itemType !== undefined) body.type = itemType;
      if (description !== undefined) body.description = description;
      if (content !== undefined) body.content = content;
      if (visibility !== undefined) body.visibility = visibility;

      const result = await intervalsRequest(`/athlete/${id}/custom-item/${itemId}`, {
        method: "PUT",
        body,
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "delete_custom_item",
    {
      title: "Delete Custom Item",
      description: "Hapus satu custom item berdasarkan ID.",
      inputSchema: {
        itemId: z.number().int().describe("ID custom item yang dihapus."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ itemId, athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/custom-item/${itemId}`, {
        method: "DELETE",
        apiKey,
      });
      return toToolResult(result);
    },
  );
}
