/**
 * Kalkulator Unified Recovery & Readiness Score (0-100%) dan Dinamika Baseline RHR.
 */

export interface RhrBaselineRange {
  low: number;
  high: number;
  avg7d?: number;
  avg28d?: number;
  avg1y?: number;
  std28d?: number;
  status?: "BALANCED" | "ELEVATED" | "SPIKE_RED_FLAG" | "SUPPRESSED";
}

export interface ReadinessInput {
  tsb: number;
  acwr: number;
  sleepScore?: number;
  hrv?: number;
  restingHr?: number;
  baselineRestingHr?: number;
  rhrBaseline?: RhrBaselineRange;
  bodyBattery?: number;
  hrvStatus?: "BALANCED" | "UNBALANCED" | "LOW" | string;
}

export interface ReadinessOutput {
  readinessScore: number;
  status: "GREEN" | "YELLOW" | "RED";
  tsbContribution: number;
  acwrContribution: number;
  wellnessContribution: number;
  recommendation: string;
}

/**
 * Menghitung rentang baseline dinamis RHR (seperti Overnight HRV Baseline Garmin)
 * berdasarkan data historis 7 hari, 28 hari (4 minggu), dan 1 tahun.
 */
export function calculateRhrBaseline(
  history: Array<number | { restingHR?: number | null }>,
  currentRhr?: number,
): RhrBaselineRange | null {
  const vals: number[] = [];
  for (const item of history) {
    if (typeof item === "number" && !isNaN(item) && item > 0) {
      vals.push(item);
    } else if (item && typeof item === "object") {
      const hr = (item as { restingHR?: number | null }).restingHR;
      if (typeof hr === "number" && !isNaN(hr) && hr > 0) {
        vals.push(hr);
      }
    }
  }

  if (vals.length === 0) return null;

  // Window calculations (diasumsikan urutan dari terlama ke terbaru)
  const last7 = vals.slice(-7);
  const avg7d = Math.round((last7.reduce((a, b) => a + b, 0) / last7.length) * 10) / 10;

  const last28 = vals.slice(-28);
  const avg28d = Math.round((last28.reduce((a, b) => a + b, 0) / last28.length) * 10) / 10;
  const variance28 =
    last28.map((x) => (x - avg28d) ** 2).reduce((a, b) => a + b, 0) / last28.length;
  const std28d = Math.round(Math.sqrt(variance28) * 10) / 10;

  let avg1y: number | undefined;
  if (vals.length >= 60) {
    avg1y = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }

  // Baseline normal range:
  // Mirip Garmin Firstbeat HRV baseline, rentang normal dibangun dari rolling average 28 hari
  // dengan toleransi deviasi standar (minimal +/- 2 bpm)
  const baselineCenter = avg28d;
  const margin = Math.max(2, Math.round(std28d));
  const low = Math.round(baselineCenter - margin);
  const high = Math.round(baselineCenter + margin);

  let status: "BALANCED" | "ELEVATED" | "SPIKE_RED_FLAG" | "SUPPRESSED" | undefined;
  if (currentRhr !== undefined) {
    const referenceAvg = avg7d ?? avg28d;
    if (currentRhr - referenceAvg > 5 || currentRhr > high + 2) {
      status = "SPIKE_RED_FLAG"; // Red Flag 1: Lonjakan simpatik parah
    } else if (currentRhr > high) {
      status = "ELEVATED"; // Di atas batas normal rentang baseline
    } else if (currentRhr < low - 4) {
      status = "SUPPRESSED"; // Penurunan drastis / kelelahan parasimpatik
    } else {
      status = "BALANCED"; // Di dalam rentang normal baseline
    }
  }

  return {
    low,
    high,
    avg7d,
    avg28d,
    avg1y,
    std28d,
    status,
  };
}

export function calculateReadinessScore(input: ReadinessInput): ReadinessOutput {
  const {
    tsb,
    acwr,
    sleepScore,
    restingHr,
    baselineRestingHr,
    rhrBaseline,
    bodyBattery,
    hrvStatus,
  } = input;

  // 1. TSB Score (40% weight)
  let tsbScore = 50;
  if (tsb >= 5 && tsb <= 25) tsbScore = 100;
  else if (tsb > 25) tsbScore = 80;
  else if (tsb >= -10 && tsb < 5) tsbScore = 75;
  else if (tsb >= -30 && tsb < -10) tsbScore = 60;
  else tsbScore = 20;

  // 2. ACWR Score (30% weight)
  let acwrScore = 50;
  if (acwr >= 0.8 && acwr <= 1.3) acwrScore = 100;
  else if (acwr > 1.3 && acwr <= 1.5) acwrScore = 60;
  else if (acwr < 0.8) acwrScore = 70;
  else acwrScore = 20;

  // 3. Wellness & Biometrics Score (30% weight)
  // Menyatukan Sleep Score dan Garmin Body Battery jika tersedia
  let baseWellness = 75;
  if (bodyBattery !== undefined && sleepScore !== undefined) {
    baseWellness = bodyBattery * 0.5 + sleepScore * 0.5;
  } else if (bodyBattery !== undefined) {
    baseWellness = bodyBattery;
  } else if (sleepScore !== undefined) {
    baseWellness = sleepScore;
  }

  // Penalti status HRV semalam (Garmin Firstbeat)
  if (hrvStatus) {
    const normalizedHrv = hrvStatus.toUpperCase();
    if (normalizedHrv === "LOW") {
      baseWellness -= 25;
    } else if (normalizedHrv === "UNBALANCED") {
      baseWellness -= 15;
    }
  }

  // Penalti Resting HR: Range Dinamis (seperti HRV) atau Fallback Scalar
  if (restingHr !== undefined) {
    if (rhrBaseline) {
      const referenceAvg = rhrBaseline.avg7d ?? rhrBaseline.avg28d ?? rhrBaseline.high;
      if (restingHr - referenceAvg > 5 || restingHr > rhrBaseline.high + 2) {
        baseWellness -= 30; // Red Flag 1 Faris Salman & Garmin
      } else if (restingHr > rhrBaseline.high) {
        baseWellness -= 15; // Peringatan: Elevated di atas baseline range normal
      } else if (restingHr < rhrBaseline.low - 4) {
        baseWellness -= 10; // Suppressed RHR
      }
    } else if (baselineRestingHr !== undefined && restingHr - baselineRestingHr > 5) {
      baseWellness -= 30;
    }
  }

  const wellnessScore = Math.max(0, Math.min(100, Math.round(baseWellness)));

  let finalScore = Math.round(tsbScore * 0.4 + acwrScore * 0.3 + wellnessScore * 0.3);

  // Safety floor: Jika Body Battery sangat kritis, cegah rekomendasi GREEN
  if (bodyBattery !== undefined && bodyBattery < 30 && finalScore >= 80) {
    finalScore = 74; // Turunkan ke status YELLOW
  }

  // Safety cap: Jika terjadi lonjakan RHR parah (Red Flag 1 Faris Salman), cegah rekomendasi GREEN
  const hasRhrSpike =
    (rhrBaseline &&
      restingHr !== undefined &&
      (restingHr - (rhrBaseline.avg7d ?? rhrBaseline.avg28d ?? rhrBaseline.high) > 5 ||
        restingHr > rhrBaseline.high + 2)) ||
    (baselineRestingHr !== undefined &&
      restingHr !== undefined &&
      restingHr - baselineRestingHr > 5);

  if (hasRhrSpike && finalScore >= 80) {
    finalScore = 74; // Turunkan ke status YELLOW
  }

  let status: "GREEN" | "YELLOW" | "RED" = "YELLOW";
  let recommendation = "";

  if (finalScore >= 80) {
    status = "GREEN";
    recommendation = "Kondisi fisik & pemulihan optimal (GREEN). Siap untuk sesi intensitas tinggi / Push Day.";
  } else if (finalScore >= 50) {
    status = "YELLOW";
    recommendation = "Kondisi fisik sedang (YELLOW). Batasi intensitas ke Zone 2 Aerobic / Easy run.";
  } else {
    status = "RED";
    recommendation = "Kelelahan tinggi / akumulasi stress (RED). Sangat disarankan deload atau istirahat total.";
  }

  return {
    readinessScore: finalScore,
    status,
    tsbContribution: Math.round(tsbScore * 0.4),
    acwrContribution: Math.round(acwrScore * 0.3),
    wellnessContribution: Math.round(wellnessScore * 0.3),
    recommendation,
  };
}

