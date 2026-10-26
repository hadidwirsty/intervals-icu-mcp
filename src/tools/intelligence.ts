import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { analyzeCardiacDrift } from "../utils/drift.js";
import { calculateRaceFuelingPlan } from "../utils/fueling.js";
import {
  calculateHaddZones,
  diagnoseAerobicBase,
  estimateAerobicThresholdProxy,
} from "../utils/hadd.js";
import { calculateTaperPlan, predictRaceTime } from "../utils/race.js";
import { calculateReadinessScore } from "../utils/readiness.js";

/**
 * Register MCP Tools for Endurance Intelligence Suite.
 */
export function registerIntelligenceTools(server: McpServer): void {
  // 1. predict_race_time
  server.tool(
    "predict_race_time",
    "Memprediksi estimasi waktu finish & pace race (5K, 10K, Half Marathon, Full Marathon, atau jarak kustom) berbasis VDOT dengan koreksi CTL (kebugaran) & TSB (kesiapan).",
    {
      vdot: z.number().describe("Nilai VDOT atlet (misal 50)."),
      targetDistanceKm: z.number().describe("Jarak race dalam kilometer (misal 21.0975 untuk Half Marathon, 42.195 untuk Full Marathon)."),
      ctl: z.number().optional().describe("Nilai kebugaran kronis (CTL 42d). Default 50."),
      tsb: z.number().optional().describe("Nilai kesiapan akut (TSB/Form). Default 0."),
    },
    async ({ vdot, targetDistanceKm, ctl, tsb }) => {
      const result = predictRaceTime({ vdot, targetDistanceKm, ctl, tsb });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 2. calculate_taper_plan
  server.tool(
    "calculate_taper_plan",
    "Menghitung jadwal dan pola tapering (A-Taper full 10-14d, B-Taper mini 4-6d, atau C-Taper no taper/workout swap) untuk memuncakkan kesiapan fisik (TSB Freshness) di hari Race.",
    {
      raceDate: z.string().describe("Tanggal race format YYYY-MM-DD."),
      currentCtl: z.number().describe("CTL atlet saat ini."),
      currentTsb: z.number().describe("TSB atlet saat ini."),
      taperWeeks: z.number().optional().describe("Durasi minggu tapering untuk Race A (2 atau 3 minggu). Default 2."),
      racePriority: z.enum(["A", "B", "C"]).optional().describe("Kategori prioritas race: A (Target Utama, Full Taper 10-14d), B (Tune-Up / CP Test, Mini Taper 4-6d), C (Training Run / Simulasi Logistik, No Taper / Swap Workout). Default 'A'."),
    },
    async ({ raceDate, currentCtl, currentTsb, taperWeeks, racePriority }) => {
      const result = calculateTaperPlan({ raceDate, currentCtl, currentTsb, taperWeeks, racePriority });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 3. analyze_cardiac_drift
  server.tool(
    "analyze_cardiac_drift",
    "Menganalisis stream telemetri (HR vs Power/Speed) untuk menghitung Efficiency Factor (EF) paruh 1 vs paruh 2 dan persentase Aerobic Decoupling.",
    {
      heartrateStream: z.array(z.number()).describe("Array time-series Heart Rate (bpm)."),
      powerOrSpeedStream: z.array(z.number()).describe("Array time-series Power (Watt) atau Speed (m/s)."),
    },
    async ({ heartrateStream, powerOrSpeedStream }) => {
      const result = analyzeCardiacDrift({ heartrateStream, powerOrSpeedStream });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 4. calculate_readiness_score
  server.tool(
    "calculate_readiness_score",
    "Memetakan TSB, ACWR, Sleep Score, Garmin Body Battery, HRV Status, dan RHR Spike ke dalam Skor Kesiapan Terpadu 0-100% (GREEN, YELLOW, RED).",
    {
      tsb: z.number().describe("Nilai TSB/Form atlet terkini."),
      acwr: z.number().describe("Nilai Acute:Chronic Workload Ratio terkini."),
      sleepScore: z.number().optional().describe("Skor kualitas tidur 0-100."),
      hrv: z.number().optional().describe("Nilai HRV rMSSD."),
      restingHr: z.number().optional().describe("Denyut jantung istirahat harian terkini."),
      baselineRestingHr: z.number().optional().describe("Baseline RHR normal atlet."),
      bodyBattery: z.number().min(0).max(100).optional().describe("Level Garmin Body Battery saat bangun / terkini (0-100)."),
      hrvStatus: z.enum(["BALANCED", "UNBALANCED", "LOW"]).optional().describe("Status resmi overnight HRV dari Garmin Connect."),
    },
    async (input) => {
      const result = calculateReadinessScore(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 5. calculate_race_fueling
  server.tool(
    "calculate_race_fueling",
    "Menghitung strategi nutrisi perlombaan adaptif multi-jarak berbasis gel energi (30g carbs: rasio maltodekstrin & dextrose/fruktosa ramah lambung), estimasi laju keringat & hidrasi untuk iklim tropis Indonesia (suhu 24–32°C, RH 70–85%), serta strategi pacing KM-by-KM untuk target lomba jalan raya (10K, Half Marathon, Full Marathon).",
    {
      raceDistanceKm: z.number().optional().describe("Jarak lomba dalam kilometer (default: 10 untuk 10K, atau 21.0975 untuk Half Marathon)."),
      predictedTimeMinutes: z.number().optional().describe("Estimasi waktu tempuh lomba dalam menit (misal 138 untuk 2h18m)."),
      athleteWeightKg: z.number().optional().describe("Berat badan atlet dalam kg (default: 70 kg)."),
      temperatureCelsius: z.number().optional().describe("Estimasi suhu rata-rata saat lomba dalam derajat Celsius (default: 26°C)."),
      relativeHumidityPct: z.number().optional().describe("Estimasi kelembapan relatif saat lomba dalam persen (default: 80%)."),
      criticalPowerWatts: z.number().optional().describe("Critical Power (CP) atlet dalam Watt (default: 295 W)."),
      vdot: z.number().optional().describe("Skor VDOT atlet (default: 31.0)."),
    },
    async (input) => {
      const result = calculateRaceFuelingPlan(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 6. diagnose_aerobic_base
  server.tool(
    "diagnose_aerobic_base",
    "Mendiagnosa kematangan sistem aerobik pelari via Frank Horwill's Rule (+10 s/km per doubling distance) dan Uphill Athlete 10% Rule ((AnT - AeT)/AnT <= 10%), mendeteksi Aerobic Deficiency Syndrome (ADS), serta memproyeksikan target lomba.",
    {
      shorterDistanceKm: z.number().positive().describe("Jarak lomba pertama (yang lebih pendek), misal 5 untuk 5K."),
      shorterTimeSeconds: z.number().positive().describe("Waktu tempuh lomba pertama dalam total detik, misal 1200 untuk 20:00."),
      shorterRaceName: z.string().optional().describe("Nama/label lomba pertama (misal '5K Baseline')."),
      longerDistanceKm: z.number().positive().describe("Jarak lomba kedua (yang lebih panjang), misal 10 untuk 10K."),
      longerTimeSeconds: z.number().positive().describe("Waktu tempuh lomba kedua dalam total detik, misal 2500 untuk 41:40."),
      longerRaceName: z.string().optional().describe("Nama/label lomba kedua (misal '10K Race')."),
      targetRaceDistanceKm: z.number().positive().optional().describe("Jarak lomba target yang ingin diproyeksikan (misal 21.0975 untuk Half Marathon)."),
      aerobicThresholdHr: z.number().min(100).max(220).optional().describe("Denyut jantung ambang aerobik atlet (AeT / LT1) dalam bpm untuk evaluasi Uphill Athlete 10% Rule. Contoh: 169."),
      anaerobicThresholdHr: z.number().min(120).max(220).optional().describe("Denyut jantung ambang anaerobik atlet (AnT / LT2 / LTHR) dalam bpm untuk evaluasi Uphill Athlete 10% Rule. Contoh: 188."),
    },
    async ({
      shorterDistanceKm,
      shorterTimeSeconds,
      shorterRaceName,
      longerDistanceKm,
      longerTimeSeconds,
      longerRaceName,
      targetRaceDistanceKm,
      aerobicThresholdHr,
      anaerobicThresholdHr,
    }) => {
      const result = diagnoseAerobicBase({
        shorterRace: {
          distanceKm: shorterDistanceKm,
          timeSeconds: shorterTimeSeconds,
          name: shorterRaceName,
        },
        longerRace: {
          distanceKm: longerDistanceKm,
          timeSeconds: longerTimeSeconds,
          name: longerRaceName,
        },
        targetRaceDistanceKm,
        aerobicThresholdHr,
        anaerobicThresholdHr,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 7. calculate_hadd_zones
  server.tool(
    "calculate_hadd_zones",
    "Menghitung zona denyut jantung latihan Hadd (Easy <= HRmax - 50, Start Threshold ~ HRmax - 35, Marathon HR ~ HRmax - 25..30) serta menyusun protokol tes bertingkat 5x 2400m Step Test dan aturan progresi bertahap ('Toothpaste Periodization').",
    {
      hrMax: z.number().min(140).max(230).describe("Denyut jantung maksimum aktual terukur atlet (bpm). Contoh: 207."),
      restingHr: z.number().optional().describe("Denyut jantung istirahat atlet (RHR) jika tersedia. Contoh: 46."),
    },
    async ({ hrMax, restingHr }) => {
      const result = calculateHaddZones({ hrMax, restingHr });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 8. estimate_aerobic_threshold
  server.tool(
    "estimate_aerobic_threshold",
    "Memperkirakan rentang denyut jantung Ambang Aerobik (AeT / LT1) atlet tanpa uji jarum laktat di laboratorium, memadukan formula Hadd (HRmax - 50 bpm), rentang 72-76% HRmax, dan target minimal 90% LTHR untuk memenuhi Uphill Athlete 10% Rule.",
    {
      hrMax: z.number().min(140).max(230).describe("Denyut jantung maksimum aktual terukur atlet (bpm). Contoh: 207."),
      lthr: z.number().min(120).max(220).optional().describe("Ambang laktat / denyut anaerobik (AnT / LTHR) jika tersedia. Contoh: 188."),
      restingHr: z.number().optional().describe("Denyut jantung istirahat (RHR). Contoh: 46."),
    },
    async ({ hrMax, lthr, restingHr }) => {
      const result = estimateAerobicThresholdProxy({ hrMax, lthr, restingHr });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}

