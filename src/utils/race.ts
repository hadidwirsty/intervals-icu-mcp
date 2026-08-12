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

export interface TaperScheduleItem {
  week: number;
  volumePct: number;
  targetTsb: number;
  guidance: string;
}

export interface TaperPlanOutput {
  raceDate: string;
  taperWeeks: number;
  weeklySchedule: TaperScheduleItem[];
}

export function calculateTaperPlan(input: {
  raceDate: string;
  currentCtl: number;
  currentTsb: number;
  taperWeeks?: number;
}): TaperPlanOutput {
  const taperWeeks = input.taperWeeks ?? 2;
  const schedule: TaperScheduleItem[] = [];

  const baseVolPct = taperWeeks === 3 ? [75, 60, 40] : [75, 50];
  let projectedTsb = input.currentTsb;

  for (let i = 0; i < taperWeeks; i++) {
    const volPct = baseVolPct[i];
    projectedTsb += (100 - volPct) * 0.3;
    schedule.push({
      week: i + 1,
      volumePct: volPct,
      targetTsb: Math.round(projectedTsb),
      guidance: `Minggu ke-${i + 1} taper: Kurangi volume ke ${volPct}% dari peak weekly load. Pertahankan intensitas interval pendek.`,
    });
  }

  return {
    raceDate: input.raceDate,
    taperWeeks,
    weeklySchedule: schedule,
  };
}
