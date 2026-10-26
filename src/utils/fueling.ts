/**
 * Pure Engine: Race Day & Fueling Execution Planner.
 *
 * Mengoptimalkan strategi nutrisi perlombaan (Half Marathon / 10K / jarak jalan raya)
 * dengan spesifikasi nutrisi gel energi terstandarisasi (30g karbohidrat per sachet:
 * rasio maltodekstrin & dekstrosa/fruktosa), hidrasi iklim tropis Indonesia (suhu 24–28°C, RH 75–85%),
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
  athleteWeightKg?: number;       // Default: 70 kg
  temperatureCelsius?: number;    // Default: 26 °C
  relativeHumidityPct?: number;   // Default: 80 %
  criticalPowerWatts?: number;    // Default: 250 W
  vdot?: number;                  // Default: 40.0
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
  const raceDistanceKm = input.raceDistanceKm ?? 21.0975;
  const raceName =
    input.raceName ??
    (raceDistanceKm <= 7
      ? "5K Race"
      : raceDistanceKm <= 14
        ? "10K Race"
        : raceDistanceKm <= 25
          ? "Half Marathon"
          : "Full Marathon");

  const predictedTimeMinutes =
    input.predictedTimeMinutes ??
    (raceDistanceKm <= 7
      ? 31
      : raceDistanceKm <= 14
        ? 64
        : raceDistanceKm <= 25
          ? 138
          : 270);

  const {
    athleteWeightKg = 70,
    temperatureCelsius = 26,
    relativeHumidityPct = 80,
    criticalPowerWatts = 250,
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
  const cp = criticalPowerWatts;
  let gelCount: number;
  let fuelingSchedule: FuelingMilestone[];
  let pacingStrategy: PacingSegment[];

  if (raceDistanceKm <= 7) {
    // 5K Race (~20–35 menit)
    gelCount = 1;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote:
          "Konsumsi 15 menit sebelum start untuk mengisi glukosa darah awal. Intra-race tidak memerlukan asupan gel tambahan.",
      },
    ];
    pacingStrategy = [
      {
        segment: "KM 1",
        title: "Controlled Acceleration",
        paceRangeFormatted: "5:30–5:40 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.90),
          max: Math.round(cp * 0.93),
        },
        powerPercentageRange: { min: 90, max: 93 },
        focus: "Hindari sprint prematur di kerumunan start. Bangun ritme kadens tinggi secara bertahap.",
      },
      {
        segment: "KM 2 - 4",
        title: "Threshold Cadence Cruise",
        paceRangeFormatted: "5:20–5:30 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.94),
          max: Math.round(cp * 0.97),
        },
        powerPercentageRange: { min: 94, max: 97 },
        focus: "Zona kerja utama. Pertahankan kadens stabil ≥ 175 rpm dengan kontrol postur tegak.",
      },
      {
        segment: "KM 5",
        title: "All-Out Finish Kick",
        paceRangeFormatted: "5:05–5:15 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.98),
          max: Math.round(cp * 1.02),
        },
        powerPercentageRange: { min: 98, max: 102 },
        focus: "Keluarkan seluruh kapasitas anaerobik cadangan menuju garis finish.",
      },
    ];
  } else if (raceDistanceKm <= 14) {
    // 10K Road Race (~50–65 menit)
    gelCount = 2;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote:
          "Konsumsi 15 menit sebelum gun start di garis start. Memastikan glukosa darah awal siap tanpa risiko lonjakan insulin prematur.",
      },
      {
        timing: "KM 5 (~28–30m)",
        distanceKm: 5,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120–150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 130,
        sodiumMg: 100,
        tacticalNote:
          "Water Station pertengahan rute (KM 5). Booster glukosa cepat untuk mengamankan ritme Sub-60 di paruh kedua rute datar pesisir.",
      },
    ];
    pacingStrategy = [
      {
        segment: "KM 1 - 2",
        title: "Calm Adrenaline Guard",
        paceRangeFormatted: "6:05–6:10 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.88), // ~258 W
          max: Math.round(cp * 0.91), // ~267 W
        },
        powerPercentageRange: { min: 88, max: 91 },
        focus:
          "Tahan nafsu di awal. Jangan terbawa arus cepat pelari lain. Biarkan denyut jantung beradaptasi secara bertahap.",
      },
      {
        segment: "KM 3 - 8",
        title: "Sub-60 Target Rhythm",
        paceRangeFormatted: "5:55–5:59 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.92), // ~270 W
          max: Math.round(cp * 0.95), // ~278 W
        },
        powerPercentageRange: { min: 92, max: 95 },
        focus:
          "Irama kerja target Sub-60 (Plan A). Jaga kadens stabil ≥ 175 rpm untuk melindungi kurva lumbar. Ambil air di WS KM 5.",
      },
      {
        segment: "KM 9 - 10",
        title: "Negative Split Finish Kick",
        paceRangeFormatted: "5:45–5:52 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.95), // ~278 W
          max: Math.round(cp * 0.98), // ~287 W
        },
        powerPercentageRange: { min: 95, max: 98 },
        focus:
          "Buka langkah progresif, manfaatkan elastisitas plate nylon Saucony Speed 5 hingga garis finish Kota Lama!",
      },
    ];
  } else if (raceDistanceKm <= 25) {
    // Half Marathon (~21.0975 km, ~2h s.d. 2h30m)
    gelCount = 4;
    fuelingSchedule = [
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
    pacingStrategy = [
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
          "Jangan terbawa euforia kerumunan start. Biarkan denyut jantung (HR) beradaptasi secara bertahap tanpa lonjakan asam laktat prematur.",
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
          "Zona target utama Sub-Threshold. Pertahankan kadens stabil >= 175 rpm untuk melindungi kurva lumbar (flat back LBP guard). Ambil hidrasi di setiap water station.",
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
          "Maksimalkan sisa glikogen dan dorongan energy return sepatu Saucony Endorphin Speed 5. Buka langkah secara bertahap hingga garis finish.",
      },
    ];
  } else {
    // Marathon (> 25 km, misal 42.195 km)
    gelCount = 6;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote: "Glukosa awal di start line.",
      },
      {
        timing: "KM 7 (~45m)",
        distanceKm: 7,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 100,
        tacticalNote: "Asupan intra-race pertama sebelum deplesi glikogen.",
      },
      {
        timing: "KM 14 (~90m)",
        distanceKm: 14,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml isotonik`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 150,
        tacticalNote: "Pertahankan level karbohidrat stabil.",
      },
      {
        timing: "KM 21 (~135m)",
        distanceKm: 21,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml isotonik`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 150,
        tacticalNote: "Setengah jarak tempuh, kunci cadangan glikogen.",
      },
      {
        timing: "KM 28 (~180m)",
        distanceKm: 28,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 120,
        tacticalNote: "Cegah fenomena 'Hitting the Wall' di KM 30+.",
      },
      {
        timing: "KM 35 (~225m)",
        distanceKm: 35,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120ml air`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 120,
        sodiumMg: 100,
        tacticalNote: "Dorongan energi terakhir untuk 7 km penutup.",
      },
    ];
    pacingStrategy = [
      {
        segment: "KM 1 - 5",
        title: "Conservative Aerobic Settle",
        paceRangeFormatted: "6:45–7:00 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.83),
          max: Math.round(cp * 0.86),
        },
        powerPercentageRange: { min: 83, max: 86 },
        focus: "Hemat glikogen semaksimal mungkin, biarkan pembakaran lemak bekerja dominan.",
      },
      {
        segment: "KM 6 - 32",
        title: "Marathon Rhythm Cruise",
        paceRangeFormatted: "6:30–6:45 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.86),
          max: Math.round(cp * 0.89),
        },
        powerPercentageRange: { min: 86, max: 89 },
        focus: "Irama kerja maraton stabil. Disiplin hidrasi dan gel di setiap interval waktu.",
      },
      {
        segment: "KM 33 - 42.2",
        title: "Resilience & Form Retention",
        paceRangeFormatted: "6:25–6:40 /km",
        powerWattsRange: {
          min: Math.round(cp * 0.88),
          max: Math.round(cp * 0.92),
        },
        powerPercentageRange: { min: 88, max: 92 },
        focus: "Pertahankan postur dan kadens tinggi saat kelelahan neuromuskular memuncak.",
      },
    ];
  }

  const totalCarbsPlannedGrams = gelCount * gelSpec.carbsGrams;
  const raceHours = predictedTimeMinutes / 60;
  const hourlyCarbsTargetGrams = Math.round((totalCarbsPlannedGrams / raceHours) * 10) / 10;

  // 4. Evaluasi Konteks Iklim Tropis Yogyakarta
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
