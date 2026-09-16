/**
 * Tools untuk events/calendar (planned workouts, notes, races) di Intervals.icu.
 */

import { z } from "zod";

import { intervalsRequest, resolveAthleteId } from "../client.js";
import { errorResult, toToolResult } from "../types.js";
import { validateWorkoutDsl } from "../utils/dsl.js";
import { generateWeeklyPlan } from "../utils/plan.js";

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

      const result = await intervalsRequest(`/athlete/${id}/events/${eventId}`, { apiKey });
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
        "Buat atau update planned workout (event kalender kategori WORKOUT, RACE_A, dll) di Intervals.icu. Kirim event_id untuk update, kosongkan untuk membuat baru. workoutDoc opsional untuk mendefinisikan struktur steps (warmup/interval/cooldown, target power/hr/pace, dll — ikuti format workout builder Intervals.icu).",
      inputSchema: {
        name: z.string().describe("Nama workout."),
        workoutType: z.string().describe("Tipe workout, contoh: Ride, Run, Swim, Walk, Row."),
        category: z
          .string()
          .optional()
          .describe("Kategori event (WORKOUT, RACE_A, RACE_B, RACE_C, NOTE). Default 'WORKOUT'."),
        athleteId: z.string().optional().describe("Athlete ID Intervals.icu. Default dari INTERVALS_ATHLETE_ID."),
        eventId: z.string().optional().describe("Event ID untuk update. Kosongkan untuk membuat event baru."),
        startDate: z.string().optional().describe("Tanggal workout, format YYYY-MM-DD. Default hari ini."),
        startTime: z
          .string()
          .optional()
          .describe("Waktu pelaksanaan, format HH:MM (contoh: '04:45'). Default '00:00'."),
        movingTime: z.number().int().positive().optional().describe("Perkiraan moving time dalam detik."),
        distance: z.number().positive().optional().describe("Perkiraan jarak dalam meter."),
        workoutDoc: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            "Struktur workout Intervals.icu, contoh: { description, steps: [{ power: { value: 80, units: '%ftp' }, duration: 900, warmup: true }, ...] }.",
          ),
        description: z
          .string()
          .optional()
          .describe("Teks deskripsi atau Teks DSL workout Intervals.icu."),
        apiKey: z.string().optional().describe("Override API key untuk request ini saja."),
      },
    },
    async ({
      name,
      workoutType,
      category,
      athleteId,
      eventId,
      startDate,
      startTime,
      movingTime,
      distance,
      workoutDoc,
      description,
      apiKey,
    }) => {
      const { id, error } = resolveAthleteId(athleteId);
      if (error) return errorResult(error);

      const date = startDate ?? new Date().toISOString().slice(0, 10);
      const timeStr = startTime ?? "00:00";
      const body: Record<string, unknown> = {
        category: category ?? "WORKOUT",
        name,
        type: workoutType,
        start_date_local: `${date}T${timeStr}:00`,
      };
      if (movingTime !== undefined) body.moving_time = movingTime;
      if (distance !== undefined) body.distance = distance;
      if (workoutDoc !== undefined) body.workout_doc = workoutDoc;
      if (description !== undefined) body.description = description;

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

  server.registerTool(
    "generate_weekly_plan",
    {
      title: "Generate Norwegian Singles Weekly Plan",
      description:
        "Hasilkan rencana latihan 1 pekan penuh (Senin s.d. Minggu) berbasis Norwegian Singles Training Method. Menghasilkan susunan 7 sesi berstruktur (pola E-Q-E-Q-E-Q-LR) lengkap dengan tanggal, jam, durasi, dan Teks DSL resmi Intervals.icu yang siap ditinjau dan diterbitkan ke kalender.",
      inputSchema: {
        startDateMonday: z
          .string()
          .describe("Tanggal hari Senin untuk minggu yang direncanakan, format YYYY-MM-DD. Contoh: '2026-09-21'."),
        targetHours: z
          .number()
          .min(3.0)
          .max(12.0)
          .optional()
          .default(6.0)
          .describe("Target durasi latihan dalam jam (default: 6.0, koridor 5.0–9.0 jam)."),
        qualitySessionsCount: z
          .union([z.literal(2), z.literal(3)])
          .optional()
          .default(3)
          .describe("Jumlah sesi kualitas Sub-T per minggu: 3 (standar) atau 2 (pemula/deload §2.3)."),
        q1Preset: z
          .enum(["short_3m", "micro_1m", "dist_1000m"])
          .optional()
          .describe("Variasi menu Sub-T untuk Quality 1 (Selasa). Default 'short_3m' (10x3m)."),
        q2Preset: z
          .enum(["medium_6m", "long_10m", "dist_2000m", "dist_3000m"])
          .optional()
          .describe("Variasi menu Sub-T untuk Quality 2 (Jumat). Default 'medium_6m' (5x6m)."),
        fastingDays: z
          .array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]))
          .optional()
          .describe("Daftar hari puasa sunnah untuk penyesuaian jam lari sore 16:45 (default: ['Monday', 'Thursday'])."),
        defaultMorningTime: z
          .string()
          .optional()
          .describe("Jam pelaksanaan lari pagi (format HH:MM, default '05:30')."),
        fastingAfternoonTime: z
          .string()
          .optional()
          .describe("Jam pelaksanaan lari ngabuburit sore (format HH:MM, default '16:45')."),
        longRunMinutes: z
          .number()
          .min(60)
          .max(180)
          .optional()
          .describe("Durasi Long Run hari Minggu dalam menit (default: 75m, atau 90m jika targetHours >= 7.0)."),
      },
    },
    async ({
      startDateMonday,
      targetHours,
      qualitySessionsCount,
      q1Preset,
      q2Preset,
      fastingDays,
      defaultMorningTime,
      fastingAfternoonTime,
      longRunMinutes,
    }) => {
      try {
        const plan = generateWeeklyPlan({
          startDateMonday,
          targetHours,
          qualitySessionsCount,
          qualityPresets: {
            q1: q1Preset,
            q2: q2Preset,
          },
          fastingDays,
          defaultMorningTime,
          fastingAfternoonTime,
          longRunMinutes,
        });
        return toToolResult(plan);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
