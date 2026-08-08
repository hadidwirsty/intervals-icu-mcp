/**
 * Tools untuk events/calendar (planned workouts, notes, races) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";
import { validateWorkoutDsl } from "../utils/dsl.js";

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

  server.registerTool(
    "get_workout_library",
    {
      title: "Get Workout Library",
      description:
        "Ambil daftar planned workout (template latihan) dari kalender Intervals.icu. Gunakan untuk melihat workout yang tersedia sebelum menjadwalkannya.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        startDate: z
          .string()
          .optional()
          .describe("Tanggal mulai pencarian, format YYYY-MM-DD. Default 1 tahun lalu."),
        endDate: z
          .string()
          .optional()
          .describe("Tanggal akhir pencarian, format YYYY-MM-DD. Default 1 tahun ke depan."),
        sport: z
          .string()
          .optional()
          .describe("Filter berdasarkan sport, contoh: 'Run', 'Ride', 'Swim'."),
        resolve: z
          .boolean()
          .optional()
          .describe(
            "Jika true, hitung target spesifik (Watt/BPM/Pace) berdasarkan setting atlet saat ini. Default false.",
          ),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, startDate, endDate, sport, resolve, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearAhead = new Date(today);
      oneYearAhead.setFullYear(today.getFullYear() + 1);

      const oldest = startDate ?? oneYearAgo.toISOString().slice(0, 10);
      const newest = endDate ?? oneYearAhead.toISOString().slice(0, 10);

      const result = await intervalsRequest(`/athlete/${id}/events`, {
        params: {
          oldest,
          newest,
          category: "WORKOUT",
          ...(sport ? { type: sport } : {}),
          ...(resolve ? { resolve: true } : {}),
        },
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "get_workout_by_id",
    {
      title: "Get Workout by ID",
      description:
        "Ambil detail satu planned workout berdasarkan event ID. Mendukung resolve=true untuk mendapatkan target spesifik (Watt/BPM/Pace) sesuai profil atlet.",
      inputSchema: {
        athleteId: z
          .string()
          .optional()
          .describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        eventId: z.string().min(1).describe("ID event/workout di kalender Intervals.icu."),
        resolve: z
          .boolean()
          .optional()
          .describe("Jika true, hitung target spesifik berdasarkan setting atlet. Default false."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ athleteId, eventId, resolve, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const result = await intervalsRequest(`/athlete/${id}/events/${eventId}`, {
        params: resolve ? { resolve: true } : undefined,
        apiKey,
      });
      return toToolResult(result);
    },
  );

  server.registerTool(
    "create_running_workout",
    {
      title: "Create Structured Running Workout",
      description:
        "Jadwalkan planned workout berstruktur di kalender Intervals.icu atlet menggunakan format Teks DSL Intervals.icu (contoh: '- 12m 70-80% power, 70-80% pace'). System akan otomatis menghitung durasi, jarak, dan load.",
      inputSchema: {
        name: z.string().describe("Judul workout, contoh: 'Mixed Intervals' atau 'Threshold Tempo Run'."),
        description: z
          .string()
          .describe(
            "Teks DSL Workout Intervals.icu. Setiap baris langkah diawali '- ' diikuti durasi dan target power/pace/HR.",
          ),
        startDate: z.string().describe("Tanggal pelaksanaan, format YYYY-MM-DD. Contoh: '2026-08-04'."),
        startTime: z
          .string()
          .optional()
          .describe("Waktu pelaksanaan, format HH:MM. Default '06:00'. Contoh: '05:00'."),
        workoutType: z
          .string()
          .optional()
          .describe("Tipe olahraga, contoh: 'Run', 'Ride', 'Swim'. Default 'Run'."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({ name, description, startDate, startTime, workoutType, athleteId, apiKey }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      try {
        const validatedDsl = validateWorkoutDsl(description);
        const timeStr = startTime ?? "06:00";
        const start_date_local = `${startDate}T${timeStr}:00`;

        const body = {
          category: "WORKOUT",
          name,
          type: workoutType ?? "Run",
          description: validatedDsl,
          start_date_local,
        };

        const result = await intervalsRequest(`/athlete/${id}/events`, {
          method: "POST",
          body,
          apiKey,
        });
        return toToolResult(result);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
