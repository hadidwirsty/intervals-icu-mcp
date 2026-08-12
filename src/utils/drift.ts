/**
 * Kalkulator Aerobic Decoupling & Cardiac Drift Engine.
 */

export interface DriftInput {
  heartrateStream: number[];
  powerOrSpeedStream: number[];
}

export interface DriftOutput {
  efHalf1: number;
  efHalf2: number;
  decouplingPct: number;
  status: "MINIMAL" | "CONTROLLED" | "EXCESSIVE";
  advice: string;
}

export function analyzeCardiacDrift(input: DriftInput): DriftOutput {
  const { heartrateStream, powerOrSpeedStream } = input;
  const len = Math.min(heartrateStream.length, powerOrSpeedStream.length);
  if (len < 10) {
    throw new Error("Stream data terlalu pendek untuk analisis cardiac drift (minimal 10 data point).");
  }

  const half = Math.floor(len / 2);

  const hr1 = heartrateStream.slice(0, half);
  const hr2 = heartrateStream.slice(half, len);
  const pwr1 = powerOrSpeedStream.slice(0, half);
  const pwr2 = powerOrSpeedStream.slice(half, len);

  const avgHr1 = hr1.reduce((a, b) => a + b, 0) / hr1.length;
  const avgHr2 = hr2.reduce((a, b) => a + b, 0) / hr2.length;
  const avgPwr1 = pwr1.reduce((a, b) => a + b, 0) / pwr1.length;
  const avgPwr2 = pwr2.reduce((a, b) => a + b, 0) / pwr2.length;

  const ef1 = avgHr1 > 0 ? avgPwr1 / avgHr1 : 0;
  const ef2 = avgHr2 > 0 ? avgPwr2 / avgHr2 : 0;

  const decouplingPct = ef1 > 0 ? Number(((1 - ef2 / ef1) * 100).toFixed(2)) : 0;

  let status: "MINIMAL" | "CONTROLLED" | "EXCESSIVE" = "CONTROLLED";
  let advice = "";

  if (decouplingPct < 3.0) {
    status = "MINIMAL";
    advice = "Aerobic engine sangat solid & efisien. Cardiac drift minimal (<3%).";
  } else if (decouplingPct <= 5.0) {
    status = "CONTROLLED";
    advice = "Cardiac drift terkendali (3–5%). Fondasi aerobik bekerja baik.";
  } else {
    status = "EXCESSIVE";
    advice = "Cardiac drift signifikan (>5%). Indikasi kelelahan kardiovaskular, dehidrasi, atau akumulasi keletihan.";
  }

  return {
    efHalf1: Number(ef1.toFixed(3)),
    efHalf2: Number(ef2.toFixed(3)),
    decouplingPct,
    status,
    advice,
  };
}
