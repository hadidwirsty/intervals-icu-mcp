/**
 * Utility functions untuk kalkulasi tanggal.
 * Pure functions — tidak ada side effects, aman untuk unit test.
 */

/**
 * Menghitung default date range: dari N hari lalu hingga hari ini.
 * @param daysBack - Jumlah hari ke belakang dari hari ini.
 * @returns Object berisi `oldest` dan `newest` dalam format YYYY-MM-DD.
 */
export function getDefaultDateRange(daysBack: number): { oldest: string; newest: string } {
  const newest = new Date().toISOString().slice(0, 10);
  const oldest = new Date(Date.now() - daysBack * 86_400_000).toISOString().slice(0, 10);
  return { oldest, newest };
}

/**
 * Menambahkan sejumlah hari ke string tanggal YYYY-MM-DD.
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error(`Format tanggal tidak valid: "${dateStr}". Gunakan YYYY-MM-DD.`);
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Mengembalikan tanggal hari Senin dari tanggal input atau hari ini.
 */
export function getMondayOfDate(dateStr?: string): string {
  let date: Date;
  if (dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) {
      throw new Error(`Format tanggal tidak valid: "${dateStr}". Gunakan YYYY-MM-DD.`);
    }
    date = new Date(Date.UTC(y, m - 1, d));
  } else {
    const now = new Date();
    date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date.toISOString().slice(0, 10);
}
