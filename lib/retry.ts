export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  maxDelayMs?: number;
  onRetry?: (error: unknown, attempt: number, nextDelayMs: number) => void;
  shouldRetry?: (error: unknown) => boolean;
}

const RETRYABLE_ERROR_SUBSTRINGS = [
  'gateway timeout',
  'bad gateway',
  'service unavailable',
  'etimedout',
  'econnreset',
  'econnrefused',
  'network error',
  'socket hang up',
  'fetch failed',
  'und_err_connect_timeout',
  'timeout',
  '504',
  '502',
  '503',
  '429',
];

export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === 'string') {
    const lower = error.toLowerCase();
    return RETRYABLE_ERROR_SUBSTRINGS.some(substr => lower.includes(substr));
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (RETRYABLE_ERROR_SUBSTRINGS.some(substr => lower.includes(substr))) {
      return true;
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    const status = (errObj.response as { status?: number } | undefined)?.status ?? (errObj.status as number | undefined);
    if (typeof status === 'number' && (status === 429 || status >= 500)) {
      return true;
    }
    const code = errObj.code;
    if (typeof code === 'string') {
      const lowerCode = code.toLowerCase();
      if (RETRYABLE_ERROR_SUBSTRINGS.some(substr => lowerCode.includes(substr))) {
        return true;
      }
    }
    const message = errObj.message;
    if (typeof message === 'string') {
      const lowerMsg = message.toLowerCase();
      if (RETRYABLE_ERROR_SUBSTRINGS.some(substr => lowerMsg.includes(substr))) {
        return true;
      }
    }
  }

  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelayMs = options?.initialDelayMs ?? 1000;
  const backoffFactor = options?.backoffFactor ?? 2;
  const maxDelayMs = options?.maxDelayMs ?? 8000;
  const shouldRetry = options?.shouldRetry ?? isRetryableError;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error: unknown) {
      attempt++;
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Add jitter (+/- 20%) to avoid synchronized stampedes
      const jitter = delay * (0.8 + Math.random() * 0.4);
      const nextDelay = Math.min(Math.round(jitter), maxDelayMs);

      if (options?.onRetry) {
        options.onRetry(error, attempt, nextDelay);
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`[withRetry] Attempt ${attempt}/${maxRetries} failed: ${errorMsg}. Retrying in ${nextDelay}ms...`);
      }

      await new Promise(resolve => setTimeout(resolve, nextDelay));
      delay = Math.min(delay * backoffFactor, maxDelayMs);
    }
  }
}
