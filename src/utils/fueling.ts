/**
 * Pure Engine: Race Day & Fueling Execution Planner.
 *
 * Mengoptimalkan strategi nutrisi perlombaan (Half Marathon / jarak jalan raya)
 * dengan spesifikasi nutrisi resmi EJ Sport Energy Gel (30g karbohidrat per sachet:
 * 12g Maltodextrin + 18g Dextrose), hidrasi iklim tropis hangat/lembab (suhu 24–28°C, RH 75–85%),
 * serta segmentasi pacing KM-by-KM berbasis Critical Power dan VDOT atlet.
 */

export interface EnergyGelSpec {
  name: string;
  carbsGrams: number;
  maltodextrinGrams: number;
  dextroseGrams: number;
  details: string;
}

export const EJ_SPORT_GEL: EnergyGelSpec = {
  name: "EJ Sport",
  carbsGrams: 30,
  maltodextrinGrams: 12,
  dextroseGrams: 18,
  details:
    "12g Maltodextrin + 18g Dextrose (Dual-Carb), 100mg L-Carnitine, Vitamin B Complex (B3 15mg, B6 1.2mg, B5 5mg).",
};

export interface RaceFuelingInput {
  raceName?: string;
  raceDistanceKm?: number;        // Default: 21.0975 km (Half Marathon)
  predictedTimeMinutes?: number;  // Default: 138 menit (~2 jam 18 menit)
  athleteWeightKg?: number;       // Default: 81 kg
  temperatureCelsius?: number;    // Default: 26 °C
  relativeHumidityPct?: number;   // Default: 80 %
  criticalPowerWatts?: number;    // Default: 293 W
  vdot?: number;                  // Default: 32
  gelSpec?: EnergyGelSpec;        // Default: EJ_SPORT_GEL
}

export interface FuelingMilestone {
  timing: string;
  distanceKm?: number;
  action: string;
  carbsGrams: number;
  fluidMl: number;
  sodiumMg: number;
  tacticalNote: string;
}

export interface PacingSegment {
  segment: string;
  title: string;
  paceRangeFormatted: string;
  powerWattsRange: { min: number; max: number };
  powerPercentageRange: { min: number; max: number };
  focus: string;
}

export interface RaceFuelingPlanResult {
  raceName: string;
  raceDistanceKm: number;
  predictedTimeMinutes: number;
  predictedTimeFormatted: string;
  hourlyCarbsTargetGrams: number;
  totalCarbsPlannedGrams: number;
  estimatedSweatRateMlPerHour: number;
  targetFluidIntakeMlPerHour: number;
  targetSodiumMgPerHour: number;
  gelBrand: string;
  gelCount: number;
  fuelingSchedule: FuelingMilestone[];
  pacingStrategy: PacingSegment[];
  climateContext: {
    temperatureCelsius: number;
    relativeHumidityPct: number;
    heatRisk: "LOW" | "MODERATE" | "HIGH";
    notes: string[];
  };
}

function formatMinutesToTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h${m.toString().padStart(2, "0")}m${s.toString().padStart(2, "0")}s`;
}

export function calculateRaceFuelingPlan(input: RaceFuelingInput = {}): RaceFuelingPlanResult {
  const {
    raceName = "Target Race (Half Marathon)",
    raceDistanceKm = 21.0975,
    predictedTimeMinutes = 138,
    athleteWeightKg = 81,
    temperatureCelsius = 26,
    relativeHumidityPct = 80,
    criticalPowerWatts = 293,
    gelSpec = EJ_SPORT_GEL,
  } = input;

  if (raceDistanceKm <= 0) {
    throw new RangeError("raceDistanceKm harus bilangan positif > 0.");
  }
  if (athleteWeightKg <= 0) {
    throw new RangeError("athleteWeightKg harus bilangan positif > 0.");
  }
  if (predictedTimeMinutes <= 0) {
    throw new RangeError("predictedTimeMinutes harus bilangan positif > 0.");
  }

  // 1. Estimasi Laju Keringat (Sweat Rate) & Hidrasi Tropis
  // Baseline ~10 ml/kg/jam di 20°C, naik ~3.5% per derajat di atas 20°C
  const tempDelta = Math.max(0, temperatureCelsius - 20);
  const tempFactor = 1 + tempDelta * 0.035;
  const rawSweatRate = athleteWeightKg * 10 * tempFactor;
  const estimatedSweatRateMlPerHour = Math.round(rawSweatRate / 10) * 10;

  // Batas aman penyerapan cairan lambung pelari: 500 - 700 ml/jam
  const targetFluidIntakeMlPerHour = 600;
  const targetSodiumMgPerHour = 400; // 350 - 500 mg / jam

  // 2. Rencana Nutrisi Karbohidrat Gel (EJ Sport: 30g per sachet)
  // Untuk Half Marathon durasi 2h s.d. 2h30m: 4 sachet total (1 pre-race + 3 intra-race)
  const gelCount = 4;
  const totalCarbsPlannedGrams = gelCount * gelSpec.carbsGrams; // 120g
  const raceHours = predictedTimeMinutes / 60;
  const hourlyCarbsTargetGrams = Math.round((totalCarbsPlannedGrams / raceHours) * 10) / 10;

  // Milestones Nutrisi
  const fuelingSchedule: FuelingMilestone[] = [
    {
      timing: "T-15m",
      action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
      carbsGrams: gelSpec.carbsGrams,
      fluidMl: 150,
      sodiumMg: 50,
      tacticalNote:
        "Konsumsi 15 menit sebelum gun start di garis start. Memastikan ketersediaan glukosa darah awal tanpa memicu insulin shock prematur.",
    },
    {
      timing: "KM 6 (~38m)",
      distanceKm: 6,
      action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120–150ml air mineral`,
      carbsGrams: gelSpec.carbsGrams,
      fluidMl: 130,
      sodiumMg: 100,
      tacticalNote:
        "Ambil air di Water Station KM 6–7. Telan gel bersama air mineral untuk mempercepat pengosongan lambung (gastric emptying).",
    },
    {
      timing: "KM 12 (~78m)",
      distanceKm: 12,
      action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120–150ml air / isotonik`,
      carbsGrams: gelSpec.carbsGrams,
      fluidMl: 140,
      sodiumMg: 150,
      tacticalNote:
        "Titik krusial pertengahan rute: Mencegah penurunan glikogen otot sebelum memasuki KM 14–17. Minum isotonik jika tersedia.",
    },
    {
      timing: "KM 17 (~108m)",
      distanceKm: 17,
      action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 100ml air mineral`,
      carbsGrams: gelSpec.carbsGrams,
      fluidMl: 100,
      sodiumMg: 100,
      tacticalNote:
        "Booster dorongan akhir untuk 4 kilometer penutup menuju garis finish.",
    },
  ];

  // 3. Segmentasi Pacing Taktis KM-by-KM (CP 293 W)
  const cp = criticalPowerWatts;
  const pacingStrategy: PacingSegment[] = [
    {
      segment: "KM 1 - 3",
      title: "Calm Adrenaline Guard",
      paceRangeFormatted: "6:40–6:55 /km",
      powerWattsRange: {
        min: Math.round(cp * 0.87), // ~255 W
        max: Math.round(cp * 0.90), // ~264 W
      },
      powerPercentageRange: { min: 87, max: 90 },
      focus:
        "Jangan terbawa euforia kerumunan di kilometer awal. Biarkan denyut jantung (HR) beradaptasi secara bertahap tanpa lonjakan asam laktat prematur.",
    },
    {
      segment: "KM 4 - 17",
      title: "Sub-Threshold Cruise Control",
      paceRangeFormatted: "6:25–6:38 /km",
      powerWattsRange: {
        min: Math.round(cp * 0.92), // ~270 W
        max: Math.round(cp * 0.94), // ~275 W
      },
      powerPercentageRange: { min: 92, max: 94 },
      focus:
        "Zona target utama Sub-Threshold. Pertahankan kadens stabil >= 175 rpm untuk efisiensi mekanis dan peredaman impak sendi. Ambil hidrasi di setiap water station.",
    },
    {
      segment: "KM 18 - 21.1",
      title: "Empty the Tank Finish",
      paceRangeFormatted: "6:15–6:25 /km",
      powerWattsRange: {
        min: Math.round(cp * 0.94), // ~275 W
        max: Math.round(cp * 0.97), // ~284 W
      },
      powerPercentageRange: { min: 94, max: 97 },
      focus:
        "Maksimalkan sisa glikogen dan dorongan energy return sepatu balap. Buka langkah secara bertahap hingga garis finish.",
    },
  ];

  // 4. Evaluasi Konteks Iklim Tropis
  let heatRisk: "LOW" | "MODERATE" | "HIGH" = "HIGH";
  if (temperatureCelsius < 22 && relativeHumidityPct < 70) {
    heatRisk = "LOW";
  } else if (temperatureCelsius <= 24) {
    heatRisk = "MODERATE";
  }

  const climateNotes: string[] = [
    `Suhu pagi ${temperatureCelsius}°C dengan kelembapan ${relativeHumidityPct}%: Tingkat stres termal tergolong ${heatRisk}.`,
    "Cardiac drift wajar terjadi akibat stres termal, bukan penurunan kapasitas aerobik; jadikan RPE (5–6/10) dan target daya Watt sebagai acuan utama (§4.2).",
    "Gunakan topi/visor, basahi tengkuk dan kepala di setiap water station untuk menjaga suhu inti tubuh (core body temperature).",
  ];

  return {
    raceName,
    raceDistanceKm,
    predictedTimeMinutes,
    predictedTimeFormatted: formatMinutesToTime(predictedTimeMinutes),
    hourlyCarbsTargetGrams,
    totalCarbsPlannedGrams,
    estimatedSweatRateMlPerHour,
    targetFluidIntakeMlPerHour,
    targetSodiumMgPerHour,
    gelBrand: gelSpec.name,
    gelCount,
    fuelingSchedule,
    pacingStrategy,
    climateContext: {
      temperatureCelsius,
      relativeHumidityPct,
      heatRisk,
      notes: climateNotes,
    },
  };
}
