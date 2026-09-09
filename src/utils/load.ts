/**
 * Utility komputasi fisiologis beban latihan (Training Load, ACWR, TSB & Ramp Rate).
 */

export interface LoadAnalysisInput {
  ctl: number;      // Chronic Training Load (42d avg load)
  atl: number;      // Acute Training Load (7d avg load)
  tsb?: number;     // Training Stress Balance (ctl - atl). Calculated if omitted.
  rampRate?: number;// Ramp rate 7d/28d per minggu.
}

export interface LoadAnalysisResult {
  ctl: number;
  atl: number;
  tsb: number;
  acwr: number;
  acwrCategory: "Under-training" | "Sweet Spot" | "Warning Zone" | "Danger Zone";
  tsbZone: "Transition" | "Fresh / Race Ready" | "Grey Zone" | "Optimal Training Zone" | "High Risk";
  rampRateStatus?: "Taper / Non-Productive" | "Minimal Build" | "Sweetspot" | "High Build" | "High Risk";
  advice: string;
}

export function analyzeTrainingLoad(input: LoadAnalysisInput): LoadAnalysisResult {
  const { ctl, atl, rampRate } = input;
  if (ctl <= 0) {
    throw new RangeError("CTL harus bilangan positif > 0.");
  }
  if (atl < 0) {
    throw new RangeError("ATL tidak boleh negatif.");
  }

  const tsb = input.tsb ?? (ctl - atl);
  const rawAcwr = atl / ctl;
  const acwr = Math.round(rawAcwr * 100) / 100;

  let acwrCategory: LoadAnalysisResult["acwrCategory"] = "Sweet Spot";
  if (acwr < 0.8) {
    acwrCategory = "Under-training";
  } else if (acwr <= 1.3) {
    acwrCategory = "Sweet Spot";
  } else if (acwr <= 1.5) {
    acwrCategory = "Warning Zone";
  } else {
    acwrCategory = "Danger Zone";
  }

  let tsbZone: LoadAnalysisResult["tsbZone"] = "Grey Zone";
  if (tsb > 25) {
    tsbZone = "Transition";
  } else if (tsb >= 5) {
    tsbZone = "Fresh / Race Ready";
  } else if (tsb >= -10) {
    tsbZone = "Grey Zone";
  } else if (tsb >= -30) {
    tsbZone = "Optimal Training Zone";
  } else {
    tsbZone = "High Risk";
  }

  let rampRateStatus: LoadAnalysisResult["rampRateStatus"] | undefined = undefined;
  if (rampRate !== undefined) {
    if (rampRate < 0) rampRateStatus = "Taper / Non-Productive";
    else if (rampRate <= 1.0) rampRateStatus = "Minimal Build";
    else if (rampRate <= 3.0) rampRateStatus = "Sweetspot";
    else if (rampRate <= 5.0) rampRateStatus = "High Build";
    else rampRateStatus = "High Risk";
  }

  let advice = "";
  if (acwrCategory === "Danger Zone" || tsbZone === "High Risk") {
    advice = "Beban latihan terlalu tinggi! Berisiko tinggi cedera atau overtraining. Disarankan recovery/easy session.";
  } else if (acwrCategory === "Sweet Spot" && tsbZone === "Optimal Training Zone") {
    advice = "Beban latihan ideal & produktif. Lanjutkan program sesuai rencana.";
  } else if (tsbZone === "Fresh / Race Ready") {
    advice = "Kondisi fisik fresh dan siap untuk race atau tes performa.";
  } else {
    advice = "Beban latihan dalam batas wajar. Jaga keseimbangan antara stimulasi dan recovery.";
  }

  return {
    ctl,
    atl,
    tsb,
    acwr,
    acwrCategory,
    tsbZone,
    rampRateStatus,
    advice,
  };
}

export interface WeeklyBudgetInput {
  avgDailyLoad: number;   // 42d avg daily load (CTL) atau avg daily distance (km)
  targetRampPct?: number; // Target persentase kenaikan (default: 5%)
}

export interface WeeklyBudgetResult {
  baseWeeklyLoad: number;
  totalWeeklyBudget: number;
  rampPct: number;
  longRunMin: number;        // ~30%
  longRunMax: number;        // ~35%
  qualityIntervalMin: number;// ~15%
  qualityIntervalMax: number;// ~20%
  easyRunMin: number;        // ~45%
  easyRunMax: number;        // ~55%
  guidelines: {
    longRun: string;
    qualityInterval: string;
    easyRun: string;
  };
}

export interface DistanceBudgetInput {
  avgDailyKm: number;            // 42d avg daily distance (km)
  targetRampPct?: number;        // Target persentase kenaikan mingguan (default: 5%)
  ninetyDayMaxLrKm?: number;    // Long Run terjauh dalam 90 hari terakhir (km) untuk batas Frandsen et al. 2025
  workoutMultiplier?: number;    // Pengali workout (default: 1.2 untuk mode aman 1.1–1.3x)
  longRunRiskPct?: number;       // Persentase risiko Frandsen (default: 104%)
}

export interface DistanceBudgetResult {
  baseWeeklyKm: number;
  totalWeeklyBudgetKm: number;
  rampPct: number;
  riskCategory: string;
  maxLongRunKm: number;
  palladinoLimitKm: number;
  frandsenLimitKm?: number;
  workoutBudgetKm: number;
  workoutMultiplier: number;
  easyRunBudgetKm: number;
  dailyEasyDistribution: {
    fourDaysKm: number;
    threeDaysKm: number;
  };
  longRunMinKm: number;
  longRunMaxKm: number;
  qualityIntervalMinKm: number;
  qualityIntervalMaxKm: number;
  easyRunMinKm: number;
  easyRunMaxKm: number;
  unit: "km";
  guidelines: {
    weekly: string;
    longRun: string;
    qualityInterval: string;
    easyRun: string;
  };
}

function getDistanceRiskCategory(rampPct: number): string {
  if (rampPct < -10) return "Recovery / Taper (🔵)";
  if (rampPct >= -10 && rampPct <= -3) return "Deload Week (🔵)";
  if (rampPct > -3 && rampPct < 3) return "Maintenance (⚪)";
  if (rampPct >= 3 && rampPct <= 8) return "Main Aman / Safe Build (🟢)";
  if (rampPct > 8 && rampPct <= 15) return "Yakin Bisa Recovery (🟡)";
  if (rampPct > 15 && rampPct <= 25) return "Risiko Tinggi (🟠)";
  return "Risiko Sangat Tinggi (🔴)";
}

export function calculateDistanceBudget(input: DistanceBudgetInput): DistanceBudgetResult {
  const {
    avgDailyKm,
    targetRampPct = 5,
    ninetyDayMaxLrKm,
    workoutMultiplier = 1.2,
    longRunRiskPct = 104,
  } = input;

  if (avgDailyKm <= 0) {
    throw new RangeError("avgDailyKm harus bilangan positif > 0.");
  }
  if (targetRampPct < -50 || targetRampPct > 30) {
    throw new RangeError("targetRampPct di luar jangkauan wajar (-50% s/d +30%).");
  }

  const baseWeeklyKm = Math.round(avgDailyKm * 7 * 10) / 10;
  const totalWeeklyBudgetKm = Math.round(baseWeeklyKm * (1 + targetRampPct / 100) * 10) / 10;
  const riskCategory = getDistanceRiskCategory(targetRampPct);

  // 1. Max Long Run Budget: min(Palladino 3x, Frandsen 90d max LR)
  const palladinoLimitKm = Math.round(3 * avgDailyKm * 10) / 10;
  let frandsenLimitKm: number | undefined;
  let maxLongRunKm = palladinoLimitKm;

  if (ninetyDayMaxLrKm !== undefined && ninetyDayMaxLrKm > 0) {
    frandsenLimitKm = Math.round(ninetyDayMaxLrKm * (longRunRiskPct / 100) * 10) / 10;
    maxLongRunKm = Math.min(palladinoLimitKm, frandsenLimitKm);
  }

  // 2. Workout Budget (Coach Faris Salman: 1.1–1.5x, default 1.2x)
  const workoutBudgetKm = Math.round(avgDailyKm * workoutMultiplier * 10) / 10;

  // 3. Easy Run Budget (Sisa Anggaran: Total - LR - Workout)
  const easyRunBudgetKm = Math.round(Math.max(0, totalWeeklyBudgetKm - maxLongRunKm - workoutBudgetKm) * 10) / 10;
  const fourDaysKm = Math.round((easyRunBudgetKm / 4) * 10) / 10;
  const threeDaysKm = Math.round((easyRunBudgetKm / 3) * 10) / 10;

  return {
    baseWeeklyKm,
    totalWeeklyBudgetKm,
    rampPct: targetRampPct,
    riskCategory,
    maxLongRunKm,
    palladinoLimitKm,
    frandsenLimitKm,
    workoutBudgetKm,
    workoutMultiplier,
    easyRunBudgetKm,
    dailyEasyDistribution: {
      fourDaysKm,
      threeDaysKm,
    },
    longRunMinKm: Math.round(maxLongRunKm * 0.85 * 10) / 10,
    longRunMaxKm: maxLongRunKm,
    qualityIntervalMinKm: Math.round(avgDailyKm * 1.1 * 10) / 10,
    qualityIntervalMaxKm: workoutBudgetKm,
    easyRunMinKm: fourDaysKm,
    easyRunMaxKm: easyRunBudgetKm,
    unit: "km",
    guidelines: {
      weekly: `Baseline: ${baseWeeklyKm} km (${avgDailyKm} km/hari x 7). Budget: ${totalWeeklyBudgetKm} km (${riskCategory}).`,
      longRun: frandsenLimitKm !== undefined
        ? `Plafon Long Run ${maxLongRunKm} km (min dari Palladino 3x: ${palladinoLimitKm} km dan Frandsen ${longRunRiskPct}%: ${frandsenLimitKm} km).`
        : `Plafon Long Run ${maxLongRunKm} km (standar Palladino 3x 42d avg km).`,
      qualityInterval: `Plafon total sesi workout/interval ${workoutBudgetKm} km (${workoutMultiplier}x 42d avg km, mencakup WU, CD, strides, interval reps, & rest).`,
      easyRun: `Sisa budget ${easyRunBudgetKm} km untuk lari santai (RPE 1-2, <=80% CP). Opsi alokasi: ${fourDaysKm} km/hari (4 hari) atau ${threeDaysKm} km/hari (3 hari).`,
    },
  };
}

export function calculateWeeklyBudget(input: WeeklyBudgetInput): WeeklyBudgetResult {
  const { avgDailyLoad, targetRampPct = 5 } = input;
  if (avgDailyLoad <= 0) {
    throw new RangeError("avgDailyLoad harus bilangan positif > 0.");
  }
  if (targetRampPct < -50 || targetRampPct > 30) {
    throw new RangeError("targetRampPct di luar jangkauan wajar (-50% s/d +30%).");
  }

  const baseWeeklyLoad = avgDailyLoad * 7;
  const totalWeeklyBudget = Math.round(baseWeeklyLoad * (1 + targetRampPct / 100) * 10) / 10;

  const longRunMin = Math.round(totalWeeklyBudget * 0.30 * 10) / 10;
  const longRunMax = Math.round(totalWeeklyBudget * 0.35 * 10) / 10;
  const qualityIntervalMin = Math.round(totalWeeklyBudget * 0.15 * 10) / 10;
  const qualityIntervalMax = Math.round(totalWeeklyBudget * 0.20 * 10) / 10;
  const easyRunMin = Math.round(totalWeeklyBudget * 0.45 * 10) / 10;
  const easyRunMax = Math.round(totalWeeklyBudget * 0.55 * 10) / 10;

  return {
    baseWeeklyLoad: Math.round(baseWeeklyLoad * 10) / 10,
    totalWeeklyBudget,
    rampPct: targetRampPct,
    longRunMin,
    longRunMax,
    qualityIntervalMin,
    qualityIntervalMax,
    easyRunMin,
    easyRunMax,
    guidelines: {
      longRun: `Maksimal 30–35% dari total budget minggu ini (${longRunMin}–${longRunMax}).`,
      qualityInterval: `Maksimal 15–20% dari total budget minggu ini (${qualityIntervalMin}–${qualityIntervalMax}).`,
      easyRun: `Alokasikan 45–55% dari total budget untuk lari easy/recovery (${easyRunMin}–${easyRunMax}).`,
    },
  };
}
