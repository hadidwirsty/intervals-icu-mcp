/**
 * Tools untuk activities (aktivitas latihan) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";
import { getDefaultDateRange } from "../utils/date.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerActivityTools(server: McpServer): void {
  server.registerTool(
    "get_activities",
    {
      title: "Get Activities",
      description:
        "Ambil daftar aktivitas latihan seorang athlete dari Intervals.icu dalam rentang tanggal tertentu.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu (contoh: i123456). Default dari INTERVALS_ATHLETE_ID."),
        startDate: z.string().optional().describe("Tanggal mulai, format YYYY-MM-DD. Default 30 hari lalu."),
        endDate: z.string().optional().describe("Tanggal akhir, format YYYY-MM-DD. Default hari ini."),
        limit: z.number().int().positive().max(200).optional().describe("Jumlah maksimum aktivitas. Default 10."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, startDate, endDate, limit, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const defaultRange = getDefaultDateRange(30);
      const oldest = startDate ?? defaultRange.oldest;
      const newest = endDate ?? defaultRange.newest;

      const result = await intervalsRequest(`/athlete/${id}/activities`, {
        params: { oldest, newest, limit: limit ?? 10 },
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_activity_details",
    {
      title: "Get Activity Details",
      description: "Ambil detail lengkap satu aktivitas berdasarkan activity ID.",
      inputSchema: {
        activityId: z.string().describe("Activity ID Intervals.icu."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ activityId, apiKey }) => {
      const result = await intervalsRequest(`/activity/${activityId}`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_activity_intervals",
    {
      title: "Get Activity Intervals",
      description: "Ambil data interval/lap (power, HR, pace per segmen) dari satu aktivitas.",
      inputSchema: {
        activityId: z.string().describe("Activity ID Intervals.icu."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ activityId, apiKey }) => {
      const result = await intervalsRequest(`/activity/${activityId}/intervals`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_activity_streams",
    {
      title: "Get Activity Streams",
      description:
        "Ambil data time-series (streams) dari satu aktivitas, misalnya power, heart rate, cadence, altitude, distance, velocity.",
      inputSchema: {
        activityId: z.string().describe("Activity ID Intervals.icu."),
        streamTypes: z
          .string()
          .optional()
          .describe(
            "Comma-separated stream types, contoh: 'time,watts,heartrate,cadence,altitude,distance,velocity_smooth'. Default ke set umum ini.",
          ),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ activityId, streamTypes, apiKey }) => {
      const types = streamTypes ?? "time,watts,heartrate,cadence,altitude,distance,velocity_smooth";
      const result = await intervalsRequest(`/activity/${activityId}/streams`, {
        params: { types },
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_activity_messages",
    {
      title: "Get Activity Messages",
      description: "Ambil catatan/komentar (messages) pada satu aktivitas.",
      inputSchema: {
        activityId: z.string().describe("Activity ID Intervals.icu."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ activityId, apiKey }) => {
      const result = await intervalsRequest(`/activity/${activityId}/messages`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "add_activity_message",
    {
      title: "Add Activity Message",
      description: "Tambahkan catatan/komentar baru ke sebuah aktivitas.",
      inputSchema: {
        activityId: z.string().describe("Activity ID Intervals.icu."),
        content: z.string().min(1).describe("Isi pesan/catatan yang ingin ditambahkan."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ activityId, content, apiKey }) => {
      const result = await intervalsRequest(`/activity/${activityId}/messages`, {
        method: "POST",
        body: { content },
        apiKey,
      });
      return toToolResult(result);
    },
  );
}
