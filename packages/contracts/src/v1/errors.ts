// ── V1 Contract: Error response schemas ──
// Stable machine-readable error codes and response body.

import { z } from 'zod';
import { VERSION_PREFIX } from './health.js';

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
}).describe(`${VERSION_PREFIX}_error_response`);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
