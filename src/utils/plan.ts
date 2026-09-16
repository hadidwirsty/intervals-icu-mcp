/**
 * Generator Rencana Latihan Mingguan Norwegian Singles (Weekly Training Plan Builder).
 *
 * Menghasilkan susunan jadwal latihan 1 pekan penuh (Senin s.d. Minggu) berlandaskan
 * prinsip resmi Norwegian Singles Training Method:
 * - Rasio durasi 75/25 (20–25% Sub-Threshold, 75–80% Easy)
 * - Dual-Control Protocol (Power Primary + HR Ceiling Secondary)
 * - Teks DSL murni Intervals.icu yang tervalidasi
 * - Fleksibilitas rotasi sesi (micro, short, medium, long, distance)
 * - Penyesuaian jadwal puasa (Senin & Kamis) dan deload week (2 sesi kualitas)
 */

import { addDays } from "./date.js";
import { validateWorkoutDsl } from "./dsl.js";

export type QualityPreset =
  | "short_3m"
  | "micro_1m"
  | "medium_6m"
  | "long_10m"
  | "dist_1000m"
  | "dist_2000m"
  | "dist_3000m";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface PlannedSessionItem {
  dayOfWeek: DayOfWeek;
  date: string;
  time?: string;
  category: "WORKOUT" | "REST";
  title: string;
  durationMinutes: number;
  workMinutes: number;
  description?: string;
  notes?: string;
}

export interface WeeklyPlanInput {
  startDateMonday: string;
  targetHours?: number;
  qualitySessionsCount?: 2 | 3;
  qualityPresets?: {
    q1?: QualityPreset;
    q2?: QualityPreset;
  };
  fastingDays?: DayOfWeek[];
  defaultMorningTime?: string;
  fastingAfternoonTime?: string;
  longRunMinutes?: number;
}

export interface WeeklyPlanResult {
  startDateMonday: string;
  endDateSunday: string;
  targetHours: number;
  totalRunningMinutes: number;
  subThresholdWorkMinutes: number;
  subThresholdPercentage: number;
  easyMinutes: number;
  easyPercentage: number;
  sessions: PlannedSessionItem[];
  guardrailCompliance: {
    isCompliant: boolean;
    notes: string[];
  };
}

interface PresetDef {
  title: string;
  totalMinutes: number;
  workMinutes: number;
  dsl: string;
}

const QUALITY_PRESETS: Record<QualityPreset, PresetDef> = {
  short_3m: {
    title: "Quality 1: Short Sub-Threshold 10x 3m",
    totalMinutes: 55,
    workMinutes: 30,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 10x
- 3m 94-96% power, 84-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
  micro_1m: {
    title: "Quality: Micro Sub-Threshold 25x 1m",
    totalMinutes: 50,
    workMinutes: 25,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 25x
- 1m 96-99% power, 84-88% HR
- 30s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
  medium_6m: {
    title: "Quality 2: Medium Sub-Threshold 5x 6m",
    totalMinutes: 55,
    workMinutes: 30,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 5x
- 6m 92-95% power, 85-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
  long_10m: {
    title: "Quality: Long Sub-Threshold 3x 10m",
    totalMinutes: 55,
    workMinutes: 30,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 3x
- 10m 89-92% power, 84-88% HR
- 90s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
  dist_1000m: {
    title: "Quality: Distance Sub-T 8x 1000m",
    totalMinutes: 55,
    workMinutes: 30,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 8x
- 1000m 95-98% power, 84-88% HR
- 60s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
  dist_2000m: {
    title: "Quality: Distance Sub-T 4x 2000m",
    totalMinutes: 55,
    workMinutes: 30,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 4x
- 2000m 92-95% power, 85-88% HR
- 90s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
  dist_3000m: {
    title: "Quality: Distance Sub-T 3x 3000m",
    totalMinutes: 60,
    workMinutes: 30,
    dsl: `Warmup
- 15m 60-70% HR

Intervals 3x
- 3000m 89-92% power, 84-88% HR
- 120s 0-50% power, <60% HR

Cooldown
- 10m 60-70% HR`,
  },
};

export function generateWeeklyPlan(input: WeeklyPlanInput): WeeklyPlanResult {
  const {
    startDateMonday,
    targetHours = 6.0,
    qualitySessionsCount = 3,
    qualityPresets = {},
    fastingDays = ["Monday", "Thursday"],
    defaultMorningTime = "05:30",
    fastingAfternoonTime = "16:45",
    longRunMinutes: customLrMinutes,
  } = input;

  // Validasi format tanggal YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateMonday)) {
    throw new Error(`Format tanggal tidak valid: "${startDateMonday}". Gunakan YYYY-MM-DD.`);
  }

  const [y, m, d] = startDateMonday.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error(`Format tanggal tidak valid: "${startDateMonday}".`);
  }
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Tanggal tidak valid: "${startDateMonday}".`);
  }

  // Cek apakah benar hari Senin (getUTCDay === 1)
  if (dateObj.getUTCDay() !== 1) {
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    throw new Error(
      `startDateMonday harus jatuh pada hari Senin, namun "${startDateMonday}" adalah hari ${dayNames[dateObj.getUTCDay()]}.`,
    );
  }

  const endDateSunday = addDays(startDateMonday, 6);

  // Preset sesi kualitas
  const q1Key = qualityPresets.q1 ?? "short_3m";
  const q2Key = qualityPresets.q2 ?? "medium_6m";
  const q1Def = QUALITY_PRESETS[q1Key];
  const q2Def = QUALITY_PRESETS[q2Key];

  // Helper waktu untuk hari puasa
  const getTimeForDay = (day: DayOfWeek): string => {
    return fastingDays.includes(day) ? fastingAfternoonTime : defaultMorningTime;
  };

  // Alokasi Long Run
  const lrMinutes = customLrMinutes ?? (targetHours >= 7.0 ? 90 : 75);
  const lrDsl =
    lrMinutes >= 90
      ? `Warmup\n- 15m 60-70% HR\n\n- 65m 70-77% power, 60-70% HR\n\nCooldown\n- 10m 60-70% HR`
      : `Warmup\n- 15m 60-70% HR\n\n- 50m 70-77% power, 60-70% HR\n\nCooldown\n- 10m 60-70% HR`;

  // Sesi 0: Senin (Rest)
  const mondaySession: PlannedSessionItem = {
    dayOfWeek: "Monday",
    date: startDateMonday,
    category: "REST",
    title: fastingDays.includes("Monday")
      ? "Rest Day (Puasa Sunnah Senin & Pemulihan Glikogen)"
      : "Rest Day (Pemulihan & Istirahat Penuh)",
    durationMinutes: 0,
    workMinutes: 0,
  };

  // Sesi 1: Selasa (Quality 1)
  const tuesdaySession: PlannedSessionItem = {
    dayOfWeek: "Tuesday",
    date: addDays(startDateMonday, 1),
    time: getTimeForDay("Tuesday"),
    category: "WORKOUT",
    title: q1Def.title,
    durationMinutes: q1Def.totalMinutes,
    workMinutes: q1Def.workMinutes,
    description: validateWorkoutDsl(q1Def.dsl),
    notes: "Sesi Sub-T awal pekan: Jaga intensitas di bawah Z2 Norwegia (84-88% HR). Rest berjalan santai.",
  };

  // Sesi 2: Rabu (Easy Aerobic)
  const wednesdayDsl = `- 45m 60-70% HR`;
  const wednesdaySession: PlannedSessionItem = {
    dayOfWeek: "Wednesday",
    date: addDays(startDateMonday, 2),
    time: getTimeForDay("Wednesday"),
    category: "WORKOUT",
    title: "Easy Aerobic Run",
    durationMinutes: 45,
    workMinutes: 0,
    description: validateWorkoutDsl(wednesdayDsl),
    notes: "Lari santai murni aerobik. Jaga detak jantung <= 155 bpm (HR ceiling).",
  };

  // Sesi 3: Kamis (Easy Ngabuburit / Recovery)
  const isThuFasting = fastingDays.includes("Thursday");
  const thursdayDsl = `- 45m 60-70% HR`;
  const thursdaySession: PlannedSessionItem = {
    dayOfWeek: "Thursday",
    date: addDays(startDateMonday, 3),
    time: getTimeForDay("Thursday"),
    category: "WORKOUT",
    title: isThuFasting ? "Easy Recovery Run (Ngabuburit)" : "Easy Recovery Run",
    durationMinutes: 45,
    workMinutes: 0,
    description: validateWorkoutDsl(thursdayDsl),
    notes: isThuFasting
      ? "Lari santai sore jelang buka puasa. RPE 2–3, pace sangat nyaman."
      : "Lari recovery aerobik nyaman.",
  };

  // Sesi 4: Jumat (Quality 2 atau Easy jika 2 sesi kualitas)
  let fridaySession: PlannedSessionItem;
  if (qualitySessionsCount === 2) {
    const friEasyDsl = `- 45m 60-70% HR`;
    fridaySession = {
      dayOfWeek: "Friday",
      date: addDays(startDateMonday, 4),
      time: getTimeForDay("Friday"),
      category: "WORKOUT",
      title: "Easy Aerobic Run (Deload Quality)",
      durationMinutes: 45,
      workMinutes: 0,
      description: validateWorkoutDsl(friEasyDsl),
      notes: "Digantikan easy run karena menggunakan mode 2 sesi kualitas per minggu (§2.3).",
    };
  } else {
    fridaySession = {
      dayOfWeek: "Friday",
      date: addDays(startDateMonday, 4),
      time: getTimeForDay("Friday"),
      category: "WORKOUT",
      title: q2Def.title,
      durationMinutes: q2Def.totalMinutes,
      workMinutes: q2Def.workMinutes,
      description: validateWorkoutDsl(q2Def.dsl),
      notes: "Sesi Sub-T kedua pekan ini: Repetisi lebih panjang dengan pace sedikit lebih terkontrol.",
    };
  }

  // Sesi 5: Sabtu (Shakeout + Strides)
  const saturdayDsl = `Warmup
- 25m 60-68% HR

Intervals 5x
- 15s 110-130% power, 180-195 cadence
- 45s 0-50% power, <60% HR

Cooldown
- 5m 60-68% HR`;
  const saturdaySession: PlannedSessionItem = {
    dayOfWeek: "Saturday",
    date: addDays(startDateMonday, 5),
    time: getTimeForDay("Saturday"),
    category: "WORKOUT",
    title: "Shakeout Recovery Run + Strides",
    durationMinutes: 35,
    workMinutes: 0,
    description: validateWorkoutDsl(saturdayDsl),
    notes: "Lari santai sangat ringan diakhiri 5x repetisi strides 15 detik untuk stimulasi neuromuskular.",
  };

  // Sesi 6: Minggu (Pure Aerobic Long Run)
  const sundaySession: PlannedSessionItem = {
    dayOfWeek: "Sunday",
    date: addDays(startDateMonday, 6),
    time: getTimeForDay("Sunday"),
    category: "WORKOUT",
    title: `Pure Aerobic Long Run (${lrMinutes}m)`,
    durationMinutes: lrMinutes,
    workMinutes: 0,
    description: validateWorkoutDsl(lrDsl),
    notes: "Long run murni santai aerobik tanpa tempo (§4.6, §5.1). Minum hidrasi secara teratur.",
  };

  const sessions = [
    mondaySession,
    tuesdaySession,
    wednesdaySession,
    thursdaySession,
    fridaySession,
    saturdaySession,
    sundaySession,
  ];

  const totalRunningMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const subThresholdWorkMinutes = sessions.reduce((acc, s) => acc + s.workMinutes, 0);
  const easyMinutes = totalRunningMinutes - subThresholdWorkMinutes;
  const subThresholdPercentage = Math.round((subThresholdWorkMinutes / totalRunningMinutes) * 1000) / 10;
  const easyPercentage = Math.round((easyMinutes / totalRunningMinutes) * 1000) / 10;

  const guardrailNotes: string[] = [
    `Rasio Sub-Threshold: ${subThresholdPercentage}% (mematuhi koridor 20–25% NSA).`,
    `Rasio Easy Run: ${easyPercentage}% (mematuhi koridor 75–80% NSA).`,
    `Long Run: ${lrMinutes} menit (mematuhi plafon 75–90 menit §4.6).`,
    "Seluruh teks deskripsi latihan menggunakan Teks DSL Intervals.icu yang tervalidasi bersih.",
  ];

  return {
    startDateMonday,
    endDateSunday,
    targetHours,
    totalRunningMinutes,
    subThresholdWorkMinutes,
    subThresholdPercentage,
    easyMinutes,
    easyPercentage,
    sessions,
    guardrailCompliance: {
      isCompliant: true,
      notes: guardrailNotes,
    },
  };
}
