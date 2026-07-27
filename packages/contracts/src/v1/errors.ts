// ── V1 Contract: Error response schemas ──
// Stable machine-readable error codes and response body.

import { z } from 'zod';

// ── Error Codes ──

export const ErrorCodeEnum = z.enum([
  'AUTH_REQUIRED',
  'INVALID_TOKEN',
  'DEVICE_REVOKED',
  'FORBIDDEN',
  'RATE_LIMITED',
  'NOT_FOUND',
  'UPSTREAM_ERROR',
  'REQUEST_ERROR',
  'INVALID_REFRESH_TOKEN',
  'TOKEN_THEFT_DETECTED',
  'DEVICE_NOT_FOUND',
  'MISSING_FIELD',
]);
export type ErrorCode = z.infer<typeof ErrorCodeEnum>;

// ── Error Response ──

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: ErrorCodeEnum,
  retryAfterMs: z.number().int().nonnegative().optional(),
}).strict();

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
