/**
 * VDOT Calculator berbasis Jack Daniels Running Formula.
 *
 * Formula:
 *   VO₂(v)     = -4.60 + 0.182258·v + 0.000104·v²    (v dalam m/min)
 *   %VO₂max(t) = 0.8 + 0.1894393·e^(-0.012778·t)
 *                    + 0.2989558·e^(-0.1932605·t)    (t dalam menit)
 *   VDOT = VO₂ / %VO₂max
 *
 * Referensi: Jack Daniels, "Daniels' Running Formula", 3rd Edition.
 */

export interface PaceZone {
  min: string; // Pace minimum (lebih cepat), format MM:SS per km
  max: string; // Pace maximum (lebih lambat), format MM:SS per km
  description: string;
}

export interface PaceZones {
  easy: PaceZone;
  marathon: PaceZone;
  threshold: PaceZone;
  interval: PaceZone;
  repetition: PaceZone;
}

/**
 * Menghitung skor VDOT dari hasil race atau sesi tempo.
 *
 * @param distanceMeters - Jarak tempuh dalam meter (harus > 0).
 * @param timeSeconds    - Waktu tempuh dalam detik (harus > 0).
 * @returns VDOT score dibulatkan ke 2 desimal.
 * @throws {RangeError} jika distanceMeters atau timeSeconds ≤ 0.
 */
export function calculateVdot(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0 || timeSeconds <= 0) {
    throw new RangeError("distanceMeters dan timeSeconds harus bilangan positif.");
  }

  const timeMinutes = timeSeconds / 60;
  const velocityMperMin = (distanceMeters / timeSeconds) * 60;

  const vo2 =
    -4.60 +
    0.182258 * velocityMperMin +
    0.000104 * Math.pow(velocityMperMin, 2);

  const percentVo2max =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMinutes) +
    0.2989558 * Math.exp(-0.1932605 * timeMinutes);

  const vdot = vo2 / percentVo2max;
  return Math.round(vdot * 100) / 100;
}

/**
 * Mengkonversi total detik menjadi string format "MM:SS".
 * @param totalSeconds - Total detik per kilometer.
 */
export function secondsToMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Menghitung kecepatan (m/min) dari VDOT dan persentase VO₂max.
 * Formula inversi dari Jack Daniels: v = (-0.182258 + sqrt(0.182258² + 4·0.000104·(vo2+4.60))) / (2·0.000104)
 */
function vdotToVelocity(vdot: number, percentVo2max: number): number {
  const vo2Target = vdot * percentVo2max;
  // Quadratic formula: 0.000104v² + 0.182258v + (-4.60 - vo2Target) = 0
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.60 - vo2Target;
  const discriminant = b * b - 4 * a * c;
  return (-b + Math.sqrt(discriminant)) / (2 * a); // m/min
}

/**
 * Menghitung zona pace latihan berdasarkan skor VDOT.
 * @param vdot - Skor VDOT (30–85).
 * @returns Object berisi 5 zona pace dalam format MM:SS per km.
 * @throws {RangeError} jika VDOT di luar range praktis (30–85).
 */
export function calculatePaceZones(vdot: number): PaceZones {
  if (vdot < 30 || vdot > 85) {
    throw new RangeError("VDOT harus antara 30 dan 85 (batas praktis Jack Daniels).");
  }

  // Persentase %vVO₂max untuk setiap zona (range min-max)
  const zones = {
    easy:       { minPct: 0.59, maxPct: 0.74, desc: "Easy / Recovery / Long Run" },
    marathon:   { minPct: 0.75, maxPct: 0.84, desc: "Marathon Race Pace" },
    threshold:  { minPct: 0.83, maxPct: 0.88, desc: "Lactate Threshold / Comfortably Hard" },
    interval:   { minPct: 0.95, maxPct: 1.00, desc: "VO₂max Intervals (3–5 menit)" },
    repetition: { minPct: 1.05, maxPct: 1.15, desc: "Speed & Economy Reps" },
  };

  const toPacePerKm = (pct: number): string => {
    const velocityMperMin = vdotToVelocity(vdot, pct);
    const secondsPerKm = 1000 / (velocityMperMin / 60);
    return secondsToMMSS(secondsPerKm);
  };

  return {
    easy: {
      min: toPacePerKm(zones.easy.maxPct), // Lebih cepat = pct lebih tinggi
      max: toPacePerKm(zones.easy.minPct), // Lebih lambat = pct lebih rendah
      description: zones.easy.desc,
    },
    marathon: {
      min: toPacePerKm(zones.marathon.maxPct),
      max: toPacePerKm(zones.marathon.minPct),
      description: zones.marathon.desc,
    },
    threshold: {
      min: toPacePerKm(zones.threshold.maxPct),
      max: toPacePerKm(zones.threshold.minPct),
      description: zones.threshold.desc,
    },
    interval: {
      min: toPacePerKm(zones.interval.maxPct),
      max: toPacePerKm(zones.interval.minPct),
      description: zones.interval.desc,
    },
    repetition: {
      min: toPacePerKm(zones.repetition.maxPct),
      max: toPacePerKm(zones.repetition.minPct),
      description: zones.repetition.desc,
    },
  };
}
