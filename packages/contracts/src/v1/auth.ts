// ── V1 Contract: Auth schemas (device registration, token refresh, revocation) ──

import { z } from 'zod';

// ── Platform Enum ──

export const PlatformEnum = z.enum(['android', 'ios']);
export type Platform = z.infer<typeof PlatformEnum>;

// ── Device Registration Request ──

export const DeviceRegistrationRequestSchema = z.object({
  enrollment_code: z.string().min(1),
  device_name: z.string().min(1),
  platform: PlatformEnum,
  push_token: z.string().optional(),
}).strict();

export type DeviceRegistrationRequest = z.infer<typeof DeviceRegistrationRequestSchema>;

// ── Token Response (base) ──

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().positive(),
  token_type: z.literal('Bearer'),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

// ── Device Registration Response ──

export const DeviceRegistrationResponseSchema = TokenResponseSchema.extend({
  device_id: z.string(),
});

export type DeviceRegistrationResponse = z.infer<typeof DeviceRegistrationResponseSchema>;

// ── Refresh Token Request ──

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string().min(1),
}).strict();

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// ── Token Refresh Response ──

export const TokenRefreshResponseSchema = TokenResponseSchema;
export type TokenRefreshResponse = z.infer<typeof TokenRefreshResponseSchema>;

// ── Device Revocation Response ──

export const DeviceRevocationResponseSchema = z.object({
  success: z.literal(true),
  device_id: z.string(),
  revoked_at: z.string(),
});

export type DeviceRevocationResponse = z.infer<typeof DeviceRevocationResponseSchema>;
