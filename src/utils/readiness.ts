/**
 * Kalkulator Unified Recovery & Readiness Score (0-100%).
 */

export interface ReadinessInput {
  tsb: number;
  acwr: number;
  sleepScore?: number;
  hrv?: number;
  restingHr?: number;
  baselineRestingHr?: number;
}

export interface ReadinessOutput {
  readinessScore: number;
  status: "GREEN" | "YELLOW" | "RED";
  tsbContribution: number;
  acwrContribution: number;
  wellnessContribution: number;
  recommendation: string;
}

export function calculateReadinessScore(input: ReadinessInput): ReadinessOutput {
  const { tsb, acwr, sleepScore = 75, restingHr, baselineRestingHr } = input;

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

  // 3. Wellness & RHR Score (30% weight)
  let wellnessScore = sleepScore;
  if (restingHr && baselineRestingHr && restingHr - baselineRestingHr > 5) {
    wellnessScore = Math.max(0, wellnessScore - 30);
  }

  const finalScore = Math.round(tsbScore * 0.4 + acwrScore * 0.3 + wellnessScore * 0.3);

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
