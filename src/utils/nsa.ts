/**
 * Norwegian Singles Training Method Interval Matrix Calculator.
 *
 * Mengimplementasikan tabel interval Time-Based resmi dari norwegiansingles.run §2.2:
 * 1. 1 min (25x) @ 10k/CV pace (~96–99% CP), rest 30s walk.
 * 2. 3 min (10–12x) @ 15k pace (~94–96% CP), rest 60s walk.
 * 3. 5–6 min (6–8x) @ 15k pace (~92–95% CP), rest 60s walk.
 * 4. 6–8 min (5–6x) @ Half marathon pace (~92–95% CP), rest 60s walk.
 * 5. 10–12 min (3–4x) @ HM - 30k pace (~89–92% CP), rest 60–120s walk.
 * 6. 15 min (3–4x) @ 30k pace (~85–88% CP), rest 90–120s walk.
 *
 * Pemetaan %CP adalah turunan berbasis Critical Power atlet terkalibrasi
 * (sumber resmi norwegiansingles.run hanya memberi pace guide relatif, bukan %CP).
 */

import { solveRaceTimeFromVdot } from "./race.js";
import { secondsToMMSS } from "./vdot.js";

export interface NsaMatrixItem {
  duration: string;
  repetitions: string;
  paceGuide: string;
  targetPacePerKm: string;
  targetPaceSeconds: number;
  powerPercentageRange: { min: number; max: number };
  targetPowerWatts: { min: number; max: number };
  targetPowerWattsFormatted: string;
  rest: string;
  notes?: string;
}

export interface NsaMatrixInput {
  vdot: number;
  criticalPowerWatts: number;
}

export interface NsaMatrixResult {
  vdot: number;
  criticalPowerWatts: number;
  intervals: NsaMatrixItem[];
  physiologicalNotes: string[];
}

function calculatePaceAndPower(
  vdot: number,
  criticalPowerWatts: number,
  distanceMeters: number,
  powerMinPct: number,
  powerMaxPct: number,
): {
  paceSeconds: number;
  paceFormatted: string;
  wattsRange: { min: number; max: number };
  wattsFormatted: string;
} {
  const raceSeconds = solveRaceTimeFromVdot(distanceMeters, vdot);
  const paceSeconds = raceSeconds / (distanceMeters / 1000);
  const minWatts = Math.round(criticalPowerWatts * (powerMinPct / 100));
  const maxWatts = Math.round(criticalPowerWatts * (powerMaxPct / 100));

  return {
    paceSeconds: Math.round(paceSeconds * 10) / 10,
    paceFormatted: `${secondsToMMSS(paceSeconds)}/km`,
    wattsRange: { min: minWatts, max: maxWatts },
    wattsFormatted: `${minWatts}–${maxWatts} W`,
  };
}

export function calculateNsaMatrix(input: NsaMatrixInput): NsaMatrixResult {
  const { vdot, criticalPowerWatts } = input;

  if (vdot < 30 || vdot > 85) {
    throw new RangeError("VDOT harus antara 30 dan 85 (rentang praktis Jack Daniels).");
  }

  if (criticalPowerWatts <= 0) {
    throw new RangeError("Critical Power (CP) harus bilangan positif > 0.");
  }

  // Jarak referensi: 10K, 15K, Half Marathon (21.0975K), 30K
  const pace10k = calculatePaceAndPower(vdot, criticalPowerWatts, 10000, 96, 99);
  const pace15k = calculatePaceAndPower(vdot, criticalPowerWatts, 15000, 94, 96);
  const pace15kLong = calculatePaceAndPower(vdot, criticalPowerWatts, 15000, 92, 95);
  const paceHM = calculatePaceAndPower(vdot, criticalPowerWatts, 21097.5, 92, 95);
  const pace30k = calculatePaceAndPower(vdot, criticalPowerWatts, 30000, 85, 88);

  // HM - 30k pace (rerata detik per km dari HM dan 30k)
  const hm30kSec = Math.round(((paceHM.paceSeconds + pace30k.paceSeconds) / 2) * 10) / 10;
  const hm30kMinWatts = Math.round(criticalPowerWatts * 0.89);
  const hm30kMaxWatts = Math.round(criticalPowerWatts * 0.92);

  const intervals: NsaMatrixItem[] = [
    {
      duration: "1 min",
      repetitions: "25x",
      paceGuide: "10k/CV pace",
      targetPacePerKm: pace10k.paceFormatted,
      targetPaceSeconds: pace10k.paceSeconds,
      powerPercentageRange: { min: 96, max: 99 },
      targetPowerWatts: pace10k.wattsRange,
      targetPowerWattsFormatted: pace10k.wattsFormatted,
      rest: "30s walk",
    },
    {
      duration: "3 min",
      repetitions: "10-12x",
      paceGuide: "15k pace",
      targetPacePerKm: pace15k.paceFormatted,
      targetPaceSeconds: pace15k.paceSeconds,
      powerPercentageRange: { min: 94, max: 96 },
      targetPowerWatts: pace15k.wattsRange,
      targetPowerWattsFormatted: pace15k.wattsFormatted,
      rest: "60s walk",
    },
    {
      duration: "5-6 min",
      repetitions: "6-8x",
      paceGuide: "15k pace",
      targetPacePerKm: pace15kLong.paceFormatted,
      targetPaceSeconds: pace15kLong.paceSeconds,
      powerPercentageRange: { min: 92, max: 95 },
      targetPowerWatts: pace15kLong.wattsRange,
      targetPowerWattsFormatted: pace15kLong.wattsFormatted,
      rest: "60s walk",
    },
    {
      duration: "6-8 min",
      repetitions: "5-6x",
      paceGuide: "Half marathon pace",
      targetPacePerKm: paceHM.paceFormatted,
      targetPaceSeconds: paceHM.paceSeconds,
      powerPercentageRange: { min: 92, max: 95 },
      targetPowerWatts: paceHM.wattsRange,
      targetPowerWattsFormatted: paceHM.wattsFormatted,
      rest: "60s walk",
    },
    {
      duration: "10-12 min",
      repetitions: "3-4x",
      paceGuide: "HM - 30k pace",
      targetPacePerKm: `${secondsToMMSS(hm30kSec)}/km`,
      targetPaceSeconds: hm30kSec,
      powerPercentageRange: { min: 89, max: 92 },
      targetPowerWatts: { min: hm30kMinWatts, max: hm30kMaxWatts },
      targetPowerWattsFormatted: `${hm30kMinWatts}–${hm30kMaxWatts} W`,
      rest: "60-120s walk",
      notes: "Format eksperimental. Mulai dengan uji coba pada 85–88% CP untuk memastikan stabilitas laktat (§4.10).",
    },
    {
      duration: "15 min",
      repetitions: "3-4x",
      paceGuide: "30k pace",
      targetPacePerKm: pace30k.paceFormatted,
      targetPaceSeconds: pace30k.paceSeconds,
      powerPercentageRange: { min: 85, max: 88 },
      targetPowerWatts: pace30k.wattsRange,
      targetPowerWattsFormatted: pace30k.wattsFormatted,
      rest: "90-120s walk",
    },
  ];

  const physiologicalNotes: string[] = [
    "Pace adalah proksi, Power adalah target turunan personal, dan Detak Jantung (HR) adalah batas mutlak (ceiling limit).",
    "Jika HR menembus batas atas zona sub-threshold (Z2 Norwegia / Z2 Friel), segera turunkan target Pace/Power.",
    "Dalam kondisi panas/lembap ekstrem (iklim tropis Yogyakarta), HR drift akibat stres termal tidak mencerminkan batas ambang aerobik murni; jadikan RPE 4–6/10 sebagai monitor utama (§4.2).",
  ];

  return {
    vdot,
    criticalPowerWatts,
    intervals,
    physiologicalNotes,
  };
}
