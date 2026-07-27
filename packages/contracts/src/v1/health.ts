// ── V1 Contract: Health & Readiness schemas ──
// All schemas carry v1 metadata for version-aware validation.

import { z } from 'zod/v4';

export const VERSION_PREFIX = 'v1';

// ── Health Response ──

export const HealthStatusEnum = z.enum(['ok', 'degraded', 'error']);
export type HealthStatus = z.infer<typeof HealthStatusEnum>;

export const IntegrationModeEnum = z.enum(['mock', 'live']);
export type IntegrationMode = z.infer<typeof IntegrationModeEnum>;

export const HealthResponseSchema = z.object({
  status: HealthStatusEnum,
  version: z.string(),
  uptime: z.number(),
  timestamp: z.string(),
  mode: IntegrationModeEnum,
}).describe(`${VERSION_PREFIX}_health_response`);

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// ── Readiness Response ──

export const ReadinessStatusEnum = z.enum(['ready', 'not_ready']);
export type ReadinessStatus = z.infer<typeof ReadinessStatusEnum>;

export const ReadinessChecksSchema = z.object({
  database: z.boolean(),
  hermes_reachable: z.boolean(),
  config_valid: z.boolean(),
});

export const ReadinessResponseSchema = z.object({
  status: ReadinessStatusEnum,
  checks: ReadinessChecksSchema,
}).describe(`${VERSION_PREFIX}_readiness_response`);

export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;
