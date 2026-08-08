// src/utils/retry.ts
/**
 * Utility untuk kalkulasi retry delay.
 * Pure functions — tidak ada side effects selain Math.random().
 */

const BASE_DELAY_MS = 1000;
const MAX_JITTER_MS = 200;

/**
 * Menghitung delay retry dengan exponential backoff dan jitter.
 *
 * @param attempt - Nomor percobaan (0-indexed). Attempt 0 = delay base.
 * @param retryAfterSeconds - Nilai dari header Retry-After (detik). Jika ada, override backoff.
 * @returns Delay dalam milliseconds.
 */
export function calculateRetryDelay(attempt: number, retryAfterSeconds?: number): number {
  const jitter = Math.floor(Math.random() * MAX_JITTER_MS);

  if (retryAfterSeconds !== undefined) {
    return retryAfterSeconds * 1000 + jitter;
  }

  return BASE_DELAY_MS * Math.pow(2, attempt) + jitter;
}
