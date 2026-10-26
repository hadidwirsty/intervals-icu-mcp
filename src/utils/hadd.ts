/**
 * Pure Engine: Hadd's Approach to Distance Training Suite.
 *
 * Mengimplementasikan prinsip saintifik John "Hadd" Walsh:
 * 1. Diagnosa basis aerobik via Frank Horwill's Rule (+10 s/km per doubling distance).
 * 2. Pemetaan zona latihan denyut jantung berbasis HRmax riil (Easy <= HRmax - 50 bpm, Threshold ~ HRmax - 35 bpm).
 * 3. Protokol tes bertingkat 5x 2400m Step Test dan aturan progresi bertahap ("Toothpaste Periodization").
 */

export interface RacePerformance {
  distanceKm: number;
  timeSeconds: number;
  name?: string;
}

export type AerobicMaturityStatus =
  | "AEROBICALLY_MATURE"
  | "DEVELOPING"
  | "AEROBICALLY_DEFICIENT"
  | "SEVERELY_DEFICIENT";

export interface HorwillDiagnosisInput {
  shorterRace: RacePerformance;
  longerRace: RacePerformance;
  targetRaceDistanceKm?: number;
  hrMax?: number;
  aerobicThresholdHr?: number;
  anaerobicThresholdHr?: number;
}

export type AdsSeverityLevel = "OPTIMAL" | "MILD" | "MODERATE" | "SEVERE";

export interface UphillAthlete10PctRuleResult {
  aerobicThresholdHr: number;
  anaerobicThresholdHr: number;
  gapBpm: number;
  gapPct: number;
  hasAerobicDeficiencySyndrome: boolean;
  severityLevel: AdsSeverityLevel;
  diagnosisStatus: "WELL_DEVELOPED_AEROBIC_ENGINE" | "AEROBIC_DEFICIENCY_SYNDROME";
  subThresholdGuidance: string;
  diagnosisDescription: string;
}

export interface AerobicThresholdProxyInput {
  hrMax: number;
  restingHr?: number;
  lthr?: number;
}

export interface AerobicThresholdProxyResult {
  hrMax: number;
  lthr?: number;
  restingHr?: number;
  estimatedAeTRangeBpm: {
    minBpm: number;
    maxBpm: number;
  };
  haddCeilingBpm: number;
  targetAeTFor10PctRuleBpm?: number;
  fieldTestProtocolRecommendations: string[];
}

export interface HorwillProjection {
  targetDistanceKm: number;
  horwillIdealPaceSecPerKm: number;
  horwillIdealPaceFormatted: string;
  horwillIdealTimeSeconds: number;
  horwillIdealTimeFormatted: string;
  currentTrendPaceSecPerKm: number;
  currentTrendPaceFormatted: string;
  currentTrendTimeSeconds: number;
  currentTrendTimeFormatted: string;
}

export interface HorwillDiagnosisResult {
  doublings: number;
  actualPaceDropPerDoublingSec: number;
  horwillBenchmarkSec: number;
  gapPerDoublingSec: number;
  status: AerobicMaturityStatus;
  statusDescription: string;
  shorterRaceSummary: {
    name: string;
    distanceKm: number;
    timeFormatted: string;
    paceFormatted: string;
    paceSecPerKm: number;
  };
  longerRaceSummary: {
    name: string;
    distanceKm: number;
    timeFormatted: string;
    actualPaceFormatted: string;
    actualPaceSecPerKm: number;
    expectedHorwillPaceFormatted: string;
    expectedHorwillTimeFormatted: string;
    gapSecondsPerKm: number;
  };
  targetProjection?: HorwillProjection;
  uphillAthleteRule?: UphillAthlete10PctRuleResult;
  tacticalRecommendations: string[];
}

export interface HaddZonesInput {
  hrMax: number;
  restingHr?: number;
  current5kPaceSecondsPerKm?: number;
}

export interface HaddStepTestStage {
  stage: number;
  distanceMeters: number;
  targetHrBpm: number;
  description: string;
  focus: string;
}

export interface HaddZonesResult {
  hrMax: number;
  restingHr?: number;
  zones: {
    recovery: {
      maxHrBpm: number;
      description: string;
    };
    easyRunning: {
      minHrBpm: number;
      maxHrBpm: number;
      formula: string;
      description: string;
    };
    startThreshold: {
      minHrBpm: number;
      maxHrBpm: number;
      targetHrBpm: number;
      formula: string;
      description: string;
    };
    marathonHr: {
      minHrBpm: number;
      maxHrBpm: number;
      formula: string;
      description: string;
    };
    halfMarathonHr: {
      minHrBpm: number;
      maxHrBpm: number;
      formula: string;
      description: string;
    };
  };
  stepTest2400mProtocol: {
    format: string;
    restBetweenStages: string;
    stages: HaddStepTestStage[];
  };
  operationalRules: {
    progressRule: string;
    testRule: string;
    readyRule: string;
    toothpastePrinciple: string;
  };
}

/**
 * Helper untuk memformat detik ke string "MM:SS" atau "HH:MM:SS".
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * 1. Diagnosa Basis Aerobik via Frank Horwill's Rule (+10 s/km per doubling distance).
 */
export function diagnoseAerobicBase(input: HorwillDiagnosisInput): HorwillDiagnosisResult {
  const { shorterRace, longerRace, targetRaceDistanceKm } = input;

  if (shorterRace.distanceKm <= 0 || longerRace.distanceKm <= 0) {
    throw new Error("Jarak lomba harus bernilai positif lebih dari 0 km.");
  }
  if (shorterRace.distanceKm >= longerRace.distanceKm) {
    throw new Error("Jarak shorterRace harus lebih pendek daripada longerRace.");
  }
  if (shorterRace.timeSeconds <= 0 || longerRace.timeSeconds <= 0) {
    throw new Error("Waktu tempuh lomba harus lebih dari 0 detik.");
  }

  const paceShorterSecPerKm = shorterRace.timeSeconds / shorterRace.distanceKm;
  const paceLongerSecPerKm = longerRace.timeSeconds / longerRace.distanceKm;

  // Rasio pelipatan jarak = log2(jarak_panjang / jarak_pendek)
  const doublings = Math.log2(longerRace.distanceKm / shorterRace.distanceKm);

  // Perlambatan aktual per doubling
  const actualPaceDropPerDoublingSec = (paceLongerSecPerKm - paceShorterSecPerKm) / doublings;

  const horwillBenchmarkSec = 10.0; // Standar Horwill: +10 s/km per doubling
  const gapPerDoublingSec = actualPaceDropPerDoublingSec - horwillBenchmarkSec;

  const expectedHorwillPaceSecPerKm = paceShorterSecPerKm + (horwillBenchmarkSec * doublings);
  const expectedHorwillTimeSeconds = expectedHorwillPaceSecPerKm * longerRace.distanceKm;
  const gapSecondsPerKm = paceLongerSecPerKm - expectedHorwillPaceSecPerKm;

  // Klasifikasi Status Aerobik
  let status: AerobicMaturityStatus;
  let statusDescription: string;

  if (actualPaceDropPerDoublingSec <= 10.0) {
    status = "AEROBICALLY_MATURE";
    statusDescription =
      "Sistem aerobik sangat matang (Aerobically Mature). Penurunan kecepatan terkontrol sempurna di bawah batas Horwill (<= +10 s/km per doubling). Otot kaki kaya mitokondria dan enzim oksidasi lemak efisien.";
  } else if (actualPaceDropPerDoublingSec <= 12.0) {
    status = "DEVELOPING";
    statusDescription =
      "Basis aerobik berkembang baik (Developing). Penurunan kecepatan wajar (+10 s/km s.d. +12 s/km per doubling). Fondasi stabil dengan sedikit potensi peningkatan volume lari santai.";
  } else if (actualPaceDropPerDoublingSec <= 15.0) {
    status = "AEROBICALLY_DEFICIENT";
    statusDescription =
      "Defisiensi aerobik nyata (Aerobically Deficient / Loose Pattern: +12 s/km s.d. +15 s/km per doubling). Pelari mulai meminjam glikogen anaerobik terlalu dini pada jarak yang lebih panjang akibat kepadatan kapiler/mitokondria lambat yang belum optimal.";
  } else {
    status = "SEVERELY_DEFICIENT";
    statusDescription =
      "Defisiensi aerobik berat (Severely Deficient: > +15 s/km per doubling). Kecepatan runtuh secara eksponensial di jarak panjang. Terjadi pemborosan bahan bakar (fuel burn far too fast) dan risiko bonking/fading ekstrem di lomba Half/Full Marathon.";
  }

  // Rekomendasi Taktis
  const tacticalRecommendations: string[] = [];

  // Evaluasi Uphill Athlete 10% Rule jika parameter tersedia
  let uphillAthleteRule: UphillAthlete10PctRuleResult | undefined;
  if (input.aerobicThresholdHr && input.anaerobicThresholdHr) {
    uphillAthleteRule = calculateUphillAthlete10PctRule(
      input.aerobicThresholdHr,
      input.anaerobicThresholdHr
    );

    if (uphillAthleteRule.severityLevel === "OPTIMAL") {
      tacticalRecommendations.push(
        `Uphill Athlete 10% Rule: Prima (Gap ${uphillAthleteRule.gapPct}% <= 10%). Lantai aerobik kokoh dan siap menopang intensitas Sub-Threshold penuh.`
      );
    } else if (uphillAthleteRule.severityLevel === "MILD") {
      tacticalRecommendations.unshift(
        `PERINGATAN ADS RINGAN (Gap ${uphillAthleteRule.gapPct}%): ${uphillAthleteRule.subThresholdGuidance}`
      );
    } else if (uphillAthleteRule.severityLevel === "MODERATE") {
      tacticalRecommendations.unshift(
        `PERINGATAN ADS SEDANG (Gap ${uphillAthleteRule.gapPct}%): ${uphillAthleteRule.subThresholdGuidance}`
      );
    } else {
      tacticalRecommendations.unshift(
        `PERINGATAN ADS BERAT / BROKEN FLOOR (Gap ${uphillAthleteRule.gapPct}%): ${uphillAthleteRule.subThresholdGuidance}`
      );
    }
  }

  if (status === "AEROBICALLY_DEFICIENT" || status === "SEVERELY_DEFICIENT") {
    tacticalRecommendations.push(
      "Prioritaskan penambahan volume kilometer mingguan secara bertahap murni pada detak jantung Easy (<= HRmax - 50 bpm) untuk merangsang biogenesis mitokondria serat lambat (Holloszy/Dudley 1982)."
    );
    tacticalRecommendations.push(
      "Dilarang memaksakan pace kencang di hari Easy Run. Berlari lebih kencang di hari santai TIDAK melatih serat lambat, melainkan membakar glikogen percuma (Hadd Part III)."
    );
    tacticalRecommendations.push(
      "Batasi sesi kualitas pada zona Sub-Threshold terkontrol (~ HRmax - 35 bpm / 85–96% CP). Hindari interval VO2max all-out sampai fondasi aerobik terisi penuh."
    );
  } else {
    tacticalRecommendations.push(
      "Pertahankan kontinuitas volume aerobik mingguan (rasio 75/25 NSA: 75–80% Easy, 20–25% Sub-T)."
    );
    tacticalRecommendations.push(
      "Maturitas aerobik Anda prima. Target jarak panjang dapat diproyeksikan dengan tingkat konfidensi tinggi mendekati kurva Horwill ideal."
    );
  }

  // Proyeksi jika ada target distance
  let targetProjection: HorwillProjection | undefined;
  if (targetRaceDistanceKm && targetRaceDistanceKm > shorterRace.distanceKm) {
    const targetDoublings = Math.log2(targetRaceDistanceKm / shorterRace.distanceKm);

    const horwillIdealPaceSecPerKm = paceShorterSecPerKm + (horwillBenchmarkSec * targetDoublings);
    const horwillIdealTimeSeconds = horwillIdealPaceSecPerKm * targetRaceDistanceKm;

    const currentTrendPaceSecPerKm = paceShorterSecPerKm + (actualPaceDropPerDoublingSec * targetDoublings);
    const currentTrendTimeSeconds = currentTrendPaceSecPerKm * targetRaceDistanceKm;

    targetProjection = {
      targetDistanceKm: targetRaceDistanceKm,
      horwillIdealPaceSecPerKm: Math.round(horwillIdealPaceSecPerKm),
      horwillIdealPaceFormatted: `${formatSecondsToTime(horwillIdealPaceSecPerKm)} /km`,
      horwillIdealTimeSeconds: Math.round(horwillIdealTimeSeconds),
      horwillIdealTimeFormatted: formatSecondsToTime(horwillIdealTimeSeconds),
      currentTrendPaceSecPerKm: Math.round(currentTrendPaceSecPerKm),
      currentTrendPaceFormatted: `${formatSecondsToTime(currentTrendPaceSecPerKm)} /km`,
      currentTrendTimeSeconds: Math.round(currentTrendTimeSeconds),
      currentTrendTimeFormatted: formatSecondsToTime(currentTrendTimeSeconds),
    };
  }

  return {
    doublings: Number(doublings.toFixed(3)),
    actualPaceDropPerDoublingSec: Number(actualPaceDropPerDoublingSec.toFixed(1)),
    horwillBenchmarkSec,
    gapPerDoublingSec: Number(gapPerDoublingSec.toFixed(1)),
    status,
    statusDescription,
    shorterRaceSummary: {
      name: shorterRace.name || `${shorterRace.distanceKm} km`,
      distanceKm: shorterRace.distanceKm,
      timeFormatted: formatSecondsToTime(shorterRace.timeSeconds),
      paceFormatted: `${formatSecondsToTime(paceShorterSecPerKm)} /km`,
      paceSecPerKm: Math.round(paceShorterSecPerKm),
    },
    longerRaceSummary: {
      name: longerRace.name || `${longerRace.distanceKm} km`,
      distanceKm: longerRace.distanceKm,
      timeFormatted: formatSecondsToTime(longerRace.timeSeconds),
      actualPaceFormatted: `${formatSecondsToTime(paceLongerSecPerKm)} /km`,
      actualPaceSecPerKm: Math.round(paceLongerSecPerKm),
      expectedHorwillPaceFormatted: `${formatSecondsToTime(expectedHorwillPaceSecPerKm)} /km`,
      expectedHorwillTimeFormatted: formatSecondsToTime(expectedHorwillTimeSeconds),
      gapSecondsPerKm: Number(gapSecondsPerKm.toFixed(1)),
    },
    targetProjection,
    uphillAthleteRule,
    tacticalRecommendations,
  };
}

/**
 * 2. Diagnosa Aerobic Deficiency Syndrome (ADS) via Uphill Athlete 10% Rule (Scott Johnston & Steve House).
 * Formula: Gap% = ((AnT - AeT) / AnT) * 100%
 * Spektrum 4 Tingkat:
 * - OPTIMAL (Gap <= 10.0%): Mesin prima, siap volume Sub-T penuh (20-25%).
 * - MILD (Gap 10.1% - 13.0%): Defisiensi ringan, toleransi Sub-T repetisi pendek (Card A 3m), perbanyak Easy.
 * - MODERATE (Gap 13.1% - 18.0%): Defisiensi sedang, tangguhkan tempo panjang, batasi Card Intro, 85-90% Easy.
 * - SEVERE (Gap > 18.0%): Lantai rusak parah, 100% Easy & Run-Walk di bawah AeT selama 12-16 minggu.
 */
export function calculateUphillAthlete10PctRule(
  aerobicThresholdHr: number,
  anaerobicThresholdHr: number
): UphillAthlete10PctRuleResult {
  if (aerobicThresholdHr <= 0 || anaerobicThresholdHr <= 0) {
    throw new Error("Nilai denyut jantung AeT dan AnT harus bernilai positif lebih dari 0 bpm.");
  }
  if (aerobicThresholdHr >= anaerobicThresholdHr) {
    throw new Error(
      `Ambang aerobik (AeT: ${aerobicThresholdHr} bpm) harus lebih rendah daripada ambang anaerobik (AnT: ${anaerobicThresholdHr} bpm).`
    );
  }

  const gapBpm = anaerobicThresholdHr - aerobicThresholdHr;
  const gapPct = (gapBpm / anaerobicThresholdHr) * 100;
  const roundedGapPct = Number(gapPct.toFixed(1));
  const hasAerobicDeficiencySyndrome = roundedGapPct > 10.0;

  let severityLevel: AdsSeverityLevel;
  let diagnosisStatus: "WELL_DEVELOPED_AEROBIC_ENGINE" | "AEROBIC_DEFICIENCY_SYNDROME";
  let subThresholdGuidance: string;
  let diagnosisDescription: string;

  if (roundedGapPct <= 10.0) {
    severityLevel = "OPTIMAL";
    diagnosisStatus = "WELL_DEVELOPED_AEROBIC_ENGINE";
    subThresholdGuidance =
      "Lantai aerobik kokoh dan matang. Siap menerima alokasi volume Sub-Threshold penuh (20–25% waktu mingguan, variasi Card A, B, hingga C).";
    diagnosisDescription =
      `Mesin aerobik prima dan sehat (Well-Developed Aerobic Engine). Celah antara AnT (${anaerobicThresholdHr} bpm) dan AeT (${aerobicThresholdHr} bpm) hanya ${gapBpm} bpm (${roundedGapPct}% <= 10%). Kapasitas mitokondria dan oksidasi lemak sangat efisien.`;
  } else if (roundedGapPct <= 13.0) {
    severityLevel = "MILD";
    diagnosisStatus = "AEROBIC_DEFICIENCY_SYNDROME";
    subThresholdGuidance =
      "Defisiensi aerobik ringan (Mild Aerobic Lag). Sesi Sub-Threshold tetap diizinkan namun HANYA format repetisi pendek (Card A: 3m reps) dengan jeda istirahat penuh. Tingkatkan porsi Easy Run santai di bawah AeT.";
    diagnosisDescription =
      `Terdiagnosa Defisiensi Aerobik Ringan (Mild Aerobic Lag: ${roundedGapPct}% > 10%). Sistem aerobik sedikit tertinggal dari kebugaran laktat. Masih aman melakukan Sub-Threshold repetisi pendek (Card A: 3m reps), hindari tempo panjang (> 6m) atau VO2max all-out.`;
  } else if (roundedGapPct <= 18.0) {
    severityLevel = "MODERATE";
    diagnosisStatus = "AEROBIC_DEFICIENCY_SYNDROME";
    subThresholdGuidance =
      "Defisiensi aerobik sedang (Moderate ADS). Tangguhkan sesi tempo panjang dan Sub-T Card B/C. Batasi kualitas hanya pada Card Intro (4x 3m) dan alokasikan 85–90% waktu mingguan untuk lari santai di bawah AeT.";
    diagnosisDescription =
      `Terdiagnosa Aerobic Deficiency Syndrome Sedang (Moderate ADS: ${roundedGapPct}% > 10%). Celah antara AnT dan AeT melebar ${gapBpm} bpm. Tubuh mulai meminjam jalur glikolisis anaerobik terlalu dini pada pace sedang. Perbanyak volume lari santai di bawah AeT (${aerobicThresholdHr} bpm).`;
  } else {
    severityLevel = "SEVERE";
    diagnosisStatus = "AEROBIC_DEFICIENCY_SYNDROME";
    subThresholdGuidance =
      "Lantai rusak parah (Broken Floor). Tangguhkan SELURUH bentuk latihan kecepatan/Sub-T. Wajib 100% Easy Run santai dan metode Run-Walk di bawah AeT selama 12–16 minggu.";
    diagnosisDescription =
      `Terdiagnosa Aerobic Deficiency Syndrome Berat (Severe ADS / Broken Floor: ${roundedGapPct}% > 18%). Celah antara AnT (${anaerobicThresholdHr} bpm) dan AeT (${aerobicThresholdHr} bpm) melebar ekstrem ${gapBpm} bpm. Sistem aerobik keropos parah. Wajib perbaiki lantai aerobik dengan 100% lari santai.`;
  }

  return {
    aerobicThresholdHr,
    anaerobicThresholdHr,
    gapBpm,
    gapPct: roundedGapPct,
    hasAerobicDeficiencySyndrome,
    severityLevel,
    diagnosisStatus,
    subThresholdGuidance,
    diagnosisDescription,
  };
}

/**
 * 3. Estimator Proksi Ambang Aerobik (AeT) Tanpa Uji Jarum Laktat.
 * Menggabungkan formula Hadd (HRmax - 50), rentang 72-76% HRmax, dan target Uphill Athlete 10% dari LTHR.
 */
export function estimateAerobicThresholdProxy(
  input: AerobicThresholdProxyInput
): AerobicThresholdProxyResult {
  const { hrMax, restingHr, lthr } = input;
  if (hrMax < 140 || hrMax > 230) {
    throw new Error(`HRmax tidak realistis: ${hrMax} bpm. Harap masukkan nilai HRmax aktual (140-230 bpm).`);
  }

  const haddCeilingBpm = hrMax - 50;
  const minBpm = Math.round(hrMax * 0.72);
  const maxBpm = Math.min(Math.round(hrMax * 0.76), haddCeilingBpm);

  let targetAeTFor10PctRuleBpm: number | undefined;
  if (lthr && lthr > 0) {
    targetAeTFor10PctRuleBpm = Math.round(lthr * 0.90);
  }

  const fieldTestProtocolRecommendations = [
    "Nose Breathing / Conversational Talk Test: Lari santai dengan bernapas 100% via hidung. Detak jantung puncak sebelum terpaksa membuka mulut adalah batas AeT lapangan Anda.",
    "Heart Rate Drift Test 60 Menit (Uphill Athlete): Lari 60 menit dengan target HR konstan (misal 155–157 bpm). Gunakan tool /cardiac-drift; jika decoupling < 3.5%, HR uji berada tepat di bawah/pada AeT.",
    "Plafon Denyut Hadd: Gunakan patokan mutlak Easy <= HRmax - 50 bpm sebagai jangkar latihan harian.",
  ];

  return {
    hrMax,
    lthr,
    restingHr,
    estimatedAeTRangeBpm: {
      minBpm,
      maxBpm,
    },
    haddCeilingBpm,
    targetAeTFor10PctRuleBpm,
    fieldTestProtocolRecommendations,
  };
}

/**
 * 2. Pemetaan Zona Denyut Jantung & Protokol Hadd 2400m Step Test.
 */
export function calculateHaddZones(input: HaddZonesInput): HaddZonesResult {
  const { hrMax, restingHr } = input;

  if (hrMax < 140 || hrMax > 230) {
    throw new Error(`HRmax tidak realistis: ${hrMax} bpm. Harap masukkan nilai HRmax aktual terukur (140-230 bpm).`);
  }

  // Formula Hadd
  const easyMaxHr = hrMax - 50;
  const easyMinHr = hrMax - 65;
  const startThresholdTarget = hrMax - 35;
  const startThresholdMin = hrMax - 37;
  const startThresholdMax = hrMax - 33;
  const marathonMin = hrMax - 30;
  const marathonMax = hrMax - 25;
  const halfMarathonMin = hrMax - 25;
  const halfMarathonMax = hrMax - 20;

  // 5 Tahap 2400m Step Test
  // Jika HRmax tinggi (>= 193), gunakan tahap standar 140, 150, 160, 170, 180 bpm
  // Jika berbeda, sesuaikan secara proporsional berjarak 10 bpm hingga mencapai ~ HRmax - 15 s.d. 20 bpm
  let stageTargetHrs: number[];
  if (hrMax >= 195) {
    const stage5 = Math.round(hrMax - 25);
    stageTargetHrs = [stage5 - 40, stage5 - 30, stage5 - 20, stage5 - 10, stage5];
  } else if (hrMax >= 185) {
    stageTargetHrs = [135, 145, 155, 165, 175];
  } else if (hrMax >= 175) {
    stageTargetHrs = [125, 135, 145, 155, 165];
  } else {
    stageTargetHrs = [115, 125, 135, 145, 155];
  }

  const stageDescriptions = [
    "Recovery / Very Easy Aerobic (Aktivasi mitokondria murni serat lambat)",
    "Aerobic Base / Steady Endurance (Bahan bakar dominan asam lemak)",
    "Moderate Aerobic / High End Easy (Transisi serat lambat ke serat IIa)",
    "Start Threshold / Sub-Threshold (Batas atas LT1 / rem asam laktat)",
    "Marathon Pace / Near LT2 (Ambang batas akumulasi laktat berkelanjutan)",
  ];

  const stages: HaddStepTestStage[] = stageTargetHrs.map((targetHr, index) => ({
    stage: index + 1,
    distanceMeters: 2400,
    targetHrBpm: targetHr,
    description: `2400m @ ${targetHr} bpm (6 putaran lintasan 400m)`,
    focus: stageDescriptions[index] || "Steady pace aerobik",
  }));

  return {
    hrMax,
    restingHr,
    zones: {
      recovery: {
        maxHrBpm: hrMax - 60,
        description: `Zona regenerasi aktif / shakeout run (<= ${hrMax - 60} bpm).`,
      },
      easyRunning: {
        minHrBpm: easyMinHr,
        maxHrBpm: easyMaxHr,
        formula: `HRmax - 65 s.d. HRmax - 50 bpm (<= ${easyMaxHr} bpm)`,
        description: `Plafon mutlak lari santai harian (<= ${easyMaxHr} bpm). Memaksimalkan adaptasi mitokondria serat lambat tanpa membakar glikogen percuma.`,
      },
      startThreshold: {
        minHrBpm: startThresholdMin,
        maxHrBpm: startThresholdMax,
        targetHrBpm: startThresholdTarget,
        formula: `HRmax - 35 bpm (~ ${startThresholdTarget} bpm)`,
        description: `Zona awal latihan Sub-Threshold (~ ${startThresholdTarget} bpm). Stimulus puncak untuk mitokondria serat Fast-Twitch Red (IIa) tanpa lonjakan asidosis.`,
      },
      marathonHr: {
        minHrBpm: marathonMin,
        maxHrBpm: marathonMax,
        formula: `HRmax - 30 s.d. HRmax - 25 bpm (${marathonMin}–${marathonMax} bpm)`,
        description: `Target denyut jantung lomba Marathon (${marathonMin}–${marathonMax} bpm).`,
      },
      halfMarathonHr: {
        minHrBpm: halfMarathonMin,
        maxHrBpm: halfMarathonMax,
        formula: `HRmax - 25 s.d. HRmax - 20 bpm (${halfMarathonMin}–${halfMarathonMax} bpm)`,
        description: `Target denyut jantung lomba Half Marathon (${halfMarathonMin}–${halfMarathonMax} bpm).`,
      },
    },
    stepTest2400mProtocol: {
      format: "5 x 2400 meter di lintasan lari standar 400m (total 12 km kerja terstruktur).",
      restBetweenStages: "90 detik jalan santai atau berdiri (bukan jogging cepat).",
      stages,
    },
    operationalRules: {
      progressRule:
        "Progress Rule: Naikkan target HR threshold sebesar +5 bpm HANYA JIKA atlet mampu menyelesaikan sesi lari 16 km pada denyut tersebut secara stabil tanpa cardiac drift atau perlambatan pace.",
      testRule:
        "Test Rule: Jalankan ulang tes bertingkat 2400m setiap ~6 pekan dalam kondisi lingkungan, suhu, dan jam yang setara untuk memverifikasi pergeseran kurva efisiensi ke kanan.",
      readyRule:
        "Ready Rule: Pelari dinyatakan siap bertanding ketika sesi 16+ km pada Marathon HR terasa stabil, dapat diulang, dan tidak menimbulkan kelelahan ekstrem berhari-hari.",
      toothpastePrinciple:
        "Toothpaste Principle: 'Like toothpaste: start at the end of the tube and squeeze slowly up.' Bangun dan peras tuntas kapasitas aerobik dari zona paling bawah sebelum menstimulasi kecepatan di puncak.",
    },
  };
}
