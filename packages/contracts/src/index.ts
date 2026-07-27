// ── Shared contracts between Hermes Mobile app and sidecar ──
// Portable TypeScript types + runtime-validatable schemas via zod.
// No Fastify, no Node, no Expo, no React Native imports.

// ── V1 Versioned Contract (runtime-validatable schemas + derived types) ──

export * from './v1/index.js';

// ── Backward-compatible type aliases ──
// These re-export the v1 types under their original names for callers
// that imported from the contract package before versioning.
// New code should import directly from the v1 module.

export type {
  HealthResponse,
  ReadinessResponse,
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  RefreshTokenRequest,
  TokenRefreshResponse,
  DeviceRevocationResponse,
  HermesCapability,
  HermesModel,
  HermesSkill,
  HermesToolset,
  SessionSummary,
  SessionMessage,
  JobSummary,
  MobileAlert,
  MobileEvent,
  HeartbeatEvent,
  ErrorResponse,
} from './v1/index.js';

// ── Legacy Permission Scopes (preserved for backward compat) ──
export { PERMISSION_SCOPES } from './v1/permissions.js';
export type { PermissionScope } from './v1/permissions.js';
