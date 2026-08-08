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
