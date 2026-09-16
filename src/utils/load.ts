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
  targetWeeklyHours?: number;   // Durasi lari mingguan dalam jam (misal 5.0 - 9.0 jam)
  currentCtl?: number;          // Chronic Training Load atlet (opsional untuk estimasi)
  qualitySessionsCount?: 2 | 3; // Jumlah sesi Sub-T per minggu (default 3, atau 2 untuk pemula §2.3)
  avgDailyLoad?: number;        // Legacy: 42d avg daily load (CTL) atau km
  targetRampPct?: number;       // Target persentase kenaikan beban (default: 5%)
}

export interface WeeklyBudgetResult {
  // Norwegian Singles time-based structure
  targetHours: number;
  totalMinutes: number;
  subThresholdBudget: {
    percentage: number;         // 20 - 25% (default 22.5%)
    totalMinutes: number;
    sessionsCount: number;
    minutesPerSession: number;
  };
  easyBudget: {
    percentage: number;         // 75 - 80% (default 77.5%)
    totalMinutes: number;
    longRunMinutes: number;     // 75 - 90 menit (§4.6)
    easyRunsMinutes: number;
    easySessionsCount: number;  // 3 atau 4 hari
    minutesPerEasySession: number;
  };
  guardrails: {
    exceedsSafeWeeklyHeadroom: boolean;    // true jika >= 8.5 jam/minggu (§6.2)
    easyDoublesRecommended: boolean;       // true jika >= 8.5 jam
    sessionWorkDurationCapMinutes: number; // 40 - 50 menit kerja Sub-T per sesi (§6.2)
    sessionWorkDistanceCapKm: number;      // 10 - 12 km kerja Sub-T per sesi (§6.2)
    status: "SAFE" | "APPROACHING_LIMIT" | "EXCEEDED";
    notes: string[];
  };

  // Legacy fields for backward compatibility
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
    weekly: string;
    subThreshold?: string;
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
  const {
    targetWeeklyHours,
    currentCtl,
    qualitySessionsCount = 3,
    avgDailyLoad,
    targetRampPct = 5,
  } = input;

  if (targetWeeklyHours !== undefined) {
    if (targetWeeklyHours <= 0 || targetWeeklyHours > 20) {
      throw new RangeError("targetWeeklyHours harus bilangan positif dalam rentang realistis (<= 20 jam).");
    }
  }

  if (avgDailyLoad !== undefined && avgDailyLoad <= 0) {
    throw new RangeError("avgDailyLoad harus bilangan positif > 0.");
  }

  if (targetRampPct < -50 || targetRampPct > 30) {
    throw new RangeError("targetRampPct di luar jangkauan wajar (-50% s/d +30%).");
  }

  // Tentukan target durasi mingguan (jam)
  let resolvedHours = targetWeeklyHours;
  if (resolvedHours === undefined) {
    if (currentCtl && currentCtl > 0) {
      resolvedHours = Math.round(Math.min(9.0, Math.max(5.0, (currentCtl * 7) / 50)) * 10) / 10;
    } else if (avgDailyLoad && avgDailyLoad > 0) {
      resolvedHours = 6.0;
    } else {
      resolvedHours = 6.0;
    }
  }

  const targetHours = resolvedHours;
  const totalMinutes = Math.round(targetHours * 60);

  // Sub-Threshold budget: 20 - 25% (default 22.5%)
  const subTPct = 22.5;
  const subTTotalMinutes = Math.round((totalMinutes * (subTPct / 100)) * 10) / 10;
  const sessionsCount = qualitySessionsCount === 2 ? 2 : 3;
  const minutesPerSession = Math.round((subTTotalMinutes / sessionsCount) * 10) / 10;

  // Easy budget: 75 - 80% (default 77.5%)
  const easyPct = 77.5;
  const easyTotalMinutes = Math.round((totalMinutes - subTTotalMinutes) * 10) / 10;
  const longRunMinutes = targetHours >= 7.0 ? 90 : 75;
  const easyRunsMinutes = Math.round((easyTotalMinutes - longRunMinutes) * 10) / 10;
  const easySessionsCount = 4;
  const minutesPerEasySession = Math.round((easyRunsMinutes / easySessionsCount) * 10) / 10;

  // Guardrails §6.2
  const exceedsSafeWeeklyHeadroom = targetHours >= 8.5;
  const easyDoublesRecommended = targetHours >= 8.5;
  let status: "SAFE" | "APPROACHING_LIMIT" | "EXCEEDED" = "SAFE";
  if (targetHours > 10.0) {
    status = "EXCEEDED";
  } else if (targetHours >= 8.5) {
    status = "APPROACHING_LIMIT";
  }

  const guardrailNotes: string[] = [
    "Alokasi durasi resmi Norwegian Singles: 20–25% Sub-Threshold dan 75–80% Easy aerobic.",
    "Batas durasi kerja Sub-T per sesi maksimal 40–50 menit atau 10–12 km (§6.2).",
    "Long run murni aerobik 75–90 menit tanpa tempo-in-LR (§4.6, §5.1).",
  ];

  if (easyDoublesRecommended) {
    guardrailNotes.unshift(
      "Volume mingguan mendekati/melebihi batas aman 8–9 jam/minggu (§6.2). Disarankan membagi lari mudah menjadi easy double (2 sesi/hari) untuk membatasi durasi sesi tunggal dan meminimalkan beban muskuloskeletal."
    );
  }

  // Legacy load fields
  const baseDaily = avgDailyLoad ?? (currentCtl ?? 45);
  const baseWeeklyLoad = Math.round(baseDaily * 7 * 10) / 10;
  const totalWeeklyBudget = Math.round(baseWeeklyLoad * (1 + targetRampPct / 100) * 10) / 10;
  const longRunMin = Math.round(totalWeeklyBudget * 0.30 * 10) / 10;
  const longRunMax = Math.round(totalWeeklyBudget * 0.35 * 10) / 10;
  const qualityIntervalMin = Math.round(totalWeeklyBudget * 0.15 * 10) / 10;
  const qualityIntervalMax = Math.round(totalWeeklyBudget * 0.20 * 10) / 10;
  const easyRunMin = Math.round(totalWeeklyBudget * 0.45 * 10) / 10;
  const easyRunMax = Math.round(totalWeeklyBudget * 0.55 * 10) / 10;

  return {
    targetHours,
    totalMinutes,
    subThresholdBudget: {
      percentage: subTPct,
      totalMinutes: subTTotalMinutes,
      sessionsCount,
      minutesPerSession,
    },
    easyBudget: {
      percentage: easyPct,
      totalMinutes: easyTotalMinutes,
      longRunMinutes,
      easyRunsMinutes,
      easySessionsCount,
      minutesPerEasySession,
    },
    guardrails: {
      exceedsSafeWeeklyHeadroom,
      easyDoublesRecommended,
      sessionWorkDurationCapMinutes: 45,
      sessionWorkDistanceCapKm: 12,
      status,
      notes: guardrailNotes,
    },
    baseWeeklyLoad,
    totalWeeklyBudget,
    rampPct: targetRampPct,
    longRunMin,
    longRunMax,
    qualityIntervalMin,
    qualityIntervalMax,
    easyRunMin,
    easyRunMax,
    guidelines: {
      weekly: `Target durasi: ${targetHours} jam (${totalMinutes} menit). Sub-T: ${subTTotalMinutes}m (${subTPct}%), Easy: ${easyTotalMinutes}m (${easyPct}%). Status: ${status}.`,
      subThreshold: `${sessionsCount}x sesi Sub-T @ ~${minutesPerSession} menit kerja/sesi (plafon 40–50m / 10–12km kerja per sesi §6.2).`,
      longRun: `Long run aerobik: ${longRunMinutes} menit (plafon 75–90 menit §4.6, tanpa tempo-in-LR §5.1).`,
      qualityInterval: `Maksimal 15–20% dari total budget minggu ini (${qualityIntervalMin}–${qualityIntervalMax} TSS).`,
      easyRun: `Alokasikan ${easyTotalMinutes} menit untuk lari santai: 1x Long Run (${longRunMinutes}m) + ${easySessionsCount}x Easy Run (@ ~${minutesPerEasySession}m/sesi).`,
    },
  };
}
