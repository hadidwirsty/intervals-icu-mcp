/**
 * Utility validasi & sanitasi Teks DSL Workout Builder Intervals.icu.
 */

export function validateWorkoutDsl(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    throw new Error("Deskripsi workout DSL tidak boleh kosong.");
  }

  const lines = trimmed.split("\n").map((line) => line.trim());
  const hasStepLine = lines.some((line) => line.startsWith("- "));

  if (!hasStepLine) {
    throw new Error(
      "Format DSL Workout tidak valid. Harus mengandung setidaknya satu baris interval berawalan '- ' (contoh: '- 12m 70-80% power, 70-80% pace').",
    );
  }

  return trimmed;
}
