/**
 * Tools untuk events/calendar (planned workouts, notes, races) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

function addDays(base: Date, days: number): string {
  return new Date(base.getTime() + days * 86400_000).toISOString().slice(0, 10);
}

export function registerEventTools(server: McpServer): void {
  server.registerTool(
    "get_events",
    {
      title: "Get Events",
      description: "Ambil daftar event kalender (planned workout, race, note) dalam rentang tanggal.",
      inputSchema: {
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        startDate: z.string().optional().describe("Tanggal mulai YYYY-MM-DD. Default hari ini."),
        endDate: z.string().optional().describe("Tanggal akhir YYYY-MM-DD. Default 30 hari ke depan."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, startDate, endDate, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const today = new Date();
      const oldest = startDate ?? addDays(today, 0);
      const newest = endDate ?? addDays(today, 30);

      const result = await intervalsRequest(`/athlete/${id}/events`, {
        params: { oldest, newest },
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_event_by_id",
    {
      title: "Get Event By ID",
      description: "Ambil detail satu event kalender berdasarkan event ID.",
      inputSchema: {
        eventId: z.string().describe("Event ID Intervals.icu."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ eventId, athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/event/${eventId}`, { apiKey });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "delete_event",
    {
      title: "Delete Event",
      description: "Hapus satu event kalender berdasarkan event ID.",
      inputSchema: {
        eventId: z.string().describe("Event ID Intervals.icu."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ eventId, athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/events/${eventId}`, {
        method: "DELETE",
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "add_or_update_planned_workout",
    {
      title: "Add or Update Planned Workout",
      description:
        "Buat atau update planned workout (event kalender kategori WORKOUT) di Intervals.icu. Kirim event_id untuk update, kosongkan untuk membuat baru. workoutDoc opsional untuk mendefinisikan struktur steps (warmup/interval/cooldown, target power/hr/pace, dll — ikuti format workout builder Intervals.icu).",
      inputSchema: {
        name: z.string().describe("Nama workout."),
        workoutType: z.string().describe("Tipe workout, contoh: Ride, Run, Swim, Walk, Row."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        eventId: z.string().optional().describe("Event ID untuk update. Kosongkan untuk membuat event baru."),
        startDate: z.string().optional().describe("Tanggal workout, format YYYY-MM-DD. Default hari ini."),
        movingTime: z.number().int().positive().optional().describe("Perkiraan moving time dalam detik."),
        distance: z.number().positive().optional().describe("Perkiraan jarak dalam meter."),
        workoutDoc: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            "Struktur workout Intervals.icu, contoh: { description, steps: [{ power: { value: 80, units: '%ftp' }, duration: 900, warmup: true }, ...] }.",
          ),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ name, workoutType, athleteId, eventId, startDate, movingTime, distance, workoutDoc, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const date = startDate ?? new Date().toISOString().slice(0, 10);
      const body: Record<string, unknown> = {
        category: "WORKOUT",
        name,
        type: workoutType,
        start_date_local: `${date}T00:00:00`,
      };
      if (movingTime !== undefined) body.moving_time = movingTime;
      if (distance !== undefined) body.distance = distance;
      if (workoutDoc !== undefined) body.workout_doc = workoutDoc;

      const path = eventId ? `/athlete/${id}/events/${eventId}` : `/athlete/${id}/events`;
      const result = await intervalsRequest(path, {
        method: eventId ? "PUT" : "POST",
        body,
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "add_or_update_note",
    {
      title: "Add or Update Note",
      description: "Buat atau update catatan teks biasa (kategori NOTE) di kalender Intervals.icu.",
      inputSchema: {
        name: z.string().describe("Judul catatan."),
        description: z.string().describe("Isi catatan (plain text)."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        eventId: z.string().optional().describe("Event ID untuk update. Kosongkan untuk membuat catatan baru."),
        startDate: z.string().optional().describe("Tanggal catatan, format YYYY-MM-DD. Default hari ini."),
        color: z.string().optional().describe("Warna catatan, contoh: green, orange, red, blue. Default green."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ name, description, athleteId, eventId, startDate, color, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const date = startDate ?? new Date().toISOString().slice(0, 10);
      const body = {
        category: "NOTE",
        name,
        description,
        start_date_local: `${date}T00:00:00`,
        color: color ?? "green",
      };

      const path = eventId ? `/athlete/${id}/events/${eventId}` : `/athlete/${id}/events`;
      const result = await intervalsRequest(path, {
        method: eventId ? "PUT" : "POST",
        body,
        apiKey,
      });
      return toToolResult(result);
    },
  );
}
