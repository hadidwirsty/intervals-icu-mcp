/**
 * Kalkulator Prediksi Race Time & Tapering Plan Generator.
 */

export interface RacePredictionInput {
  vdot: number;
  targetDistanceKm: number;
  ctl?: number;
  tsb?: number;
}

export interface RacePredictionOutput {
  vdot: number;
  targetDistanceKm: number;
  predictedTimeSeconds: number;
  predictedTimeFormatted: string;
  predictedPaceFormatted: string;
  ctlAdjustmentFactor: number;
  tsbAdjustmentFactor: number;
}

function secondsToFormatted(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}h${m.toString().padStart(2, "0")}m${s.toString().padStart(2, "0")}s`;
  }
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

function paceToFormatted(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

export function predictRaceTime(input: RacePredictionInput): RacePredictionOutput {
  const { vdot, targetDistanceKm, ctl = 50, tsb = 0 } = input;
  if (vdot <= 0 || targetDistanceKm <= 0) {
    throw new Error("VDOT dan target distance harus bernilai positif.");
  }

  const ctlFactor = Math.max(0.95, Math.min(1.05, 1 - (ctl - 50) / 500));
  const tsbFactor = Math.max(0.96, Math.min(1.04, 1 - tsb / 500));

  const base5kSec = (29.5 - 0.19 * vdot) * 60;
  const baseSec = base5kSec * Math.pow(targetDistanceKm / 5, 1.06);

  const adjustedSec = Math.round(baseSec * ctlFactor * tsbFactor);
  const secPerKm = adjustedSec / targetDistanceKm;

  return {
    vdot,
    targetDistanceKm,
    predictedTimeSeconds: adjustedSec,
    predictedTimeFormatted: secondsToFormatted(adjustedSec),
    predictedPaceFormatted: paceToFormatted(secPerKm),
    ctlAdjustmentFactor: Number(ctlFactor.toFixed(3)),
    tsbAdjustmentFactor: Number(tsbFactor.toFixed(3)),
  };
}

export type RacePriority = "A" | "B" | "C";

export interface TaperScheduleItem {
  week: number;
  volumePct: number;
  targetTsb: number;
  guidance: string;
}

export interface TaperPlanOutput {
  raceDate: string;
  racePriority: RacePriority;
  taperTypeDescription: string;
  targetFinishRpe: string;
  taperWeeks: number;
  weeklySchedule: TaperScheduleItem[];
  subthresholdGapRule?: string;
  egoManagementRule?: string;
}

export function calculateTaperPlan(input: {
  raceDate: string;
  currentCtl: number;
  currentTsb: number;
  taperWeeks?: number;
  racePriority?: RacePriority;
}): TaperPlanOutput {
  const racePriority: RacePriority = input.racePriority ?? "A";

  if (racePriority === "B") {
    const taperWeeks = 1;
    const projectedTsb = Math.round(input.currentTsb + 15 * 0.3);
    return {
      raceDate: input.raceDate,
      racePriority: "B",
      taperTypeDescription: "B-Taper (Mini Taper 4–6 Hari)",
      targetFinishRpe: "8–9 / 10 (Hampir all-out / Fitness Check & CP Test)",
      taperWeeks,
      weeklySchedule: [
        {
          week: 1,
          volumePct: 85,
          targetTsb: projectedTsb,
          guidance:
            "Mini-taper 4–6 hari: Eliminasi severe stressor (VO₂max). Pertahankan frekuensi lari normal dengan volume moderat (~85%).",
        },
      ],
      subthresholdGapRule:
        "Jika terdapat sesi Subthreshold di pekan race, wajib berikan jeda minimal 4 hari sebelum hari pelaksanaan B-Race.",
    };
  }

  if (racePriority === "C") {
    const taperWeeks = 1;
    return {
      raceDate: input.raceDate,
      racePriority: "C",
      taperTypeDescription: "C-Taper (No Taper / Workout Swap)",
      targetFinishRpe: "6–7 / 10 (Controlled Training Run / Marathon Simulation)",
      taperWeeks,
      weeklySchedule: [
        {
          week: 1,
          volumePct: 100,
          targetTsb: Math.round(input.currentTsb),
          guidance:
            "No taper: Jalankan minggu latihan normal (volume 100%). Tukar 1 hari hard workout mingguan menjadi Easy Run (atau perlakukan C-Race sebagai sesi Quality/Long Run @ LT1).",
        },
      ],
      egoManagementRule:
        "Joe Friel's Rule: 'Never let ego disrupt periodization.' Jangan pernah meng-upgrade C-Race menjadi all-out effort di tengah perlombaan hanya karena merasa segar atau terbawa atmosfer pelari lain. Kerusakan otot tak terencana akan mengorbankan program dan membatalkan peak Race A utama!",
    };
  }

  // Default: Race A (Full Taper 10-14 hari / 2-3 minggu)
  const taperWeeks = input.taperWeeks ?? 2;
  const schedule: TaperScheduleItem[] = [];
  const baseVolPct = taperWeeks === 3 ? [75, 60, 40] : [75, 50];
  let projectedTsb = input.currentTsb;

  for (let i = 0; i < taperWeeks; i++) {
    const volPct = baseVolPct[i];
    projectedTsb += (100 - volPct) * 0.3;
    const isFinalWeek = i === taperWeeks - 1;
    const guidance = isFinalWeek
      ? `Minggu ke-${i + 1} (Race Week): Volume turun ke ${volPct}% dari peak weekly load. Frekuensi lari mingguan TETAP (jaga ritme neuromuskular), potong durasi/repetisi interval ~50% (misal SubT 6x3' rest 1', Strides 5x). TSB segar & siap all-out!`
      : `Minggu ke-${i + 1} (Taper 1): Kurangi volume ke ${volPct}% dari peak weekly load. Frekuensi lari tetap, pertahankan ketajaman intensitas spesifik, kurangi volume per sesi.`;

    schedule.push({
      week: i + 1,
      volumePct: volPct,
      targetTsb: Math.round(projectedTsb),
      guidance,
    });
  }

  return {
    raceDate: input.raceDate,
    racePriority: "A",
    taperTypeDescription: `A-Taper (Full Taper ${taperWeeks === 3 ? "14–21" : "10–14"} Hari)`,
    targetFinishRpe: "9–10 / 10 (All-out effort / Peak Performance)",
    taperWeeks,
    weeklySchedule: schedule,
  };
}
