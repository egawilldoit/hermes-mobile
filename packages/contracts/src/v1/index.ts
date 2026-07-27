// ── V1 Contract: Versioned mobile-sidecar schemas ──
// Single authoritative source for v1 mobile-sidecar wire knowledge.
// All schemas provide runtime validation via zod.

export { VERSION_PREFIX } from './health.js';

// ── Health & Readiness ──
export {
  HealthStatusEnum,
  HealthResponseSchema,
  ReadinessStatusEnum,
  ReadinessChecksSchema,
  ReadinessResponseSchema,
} from './health.js';
export type {
  HealthStatus,
  HealthResponse,
  IntegrationMode,
  ReadinessStatus,
  ReadinessResponse,
} from './health.js';

// ── Auth ──
export {
  PlatformEnum,
  DeviceRegistrationRequestSchema,
  TokenResponseSchema,
  DeviceRegistrationResponseSchema,
  RefreshTokenRequestSchema,
  TokenRefreshResponseSchema,
  DeviceRevocationResponseSchema,
} from './auth.js';
export type {
  Platform,
  DeviceRegistrationRequest,
  TokenResponse,
  DeviceRegistrationResponse,
  RefreshTokenRequest,
  TokenRefreshResponse,
  DeviceRevocationResponse,
} from './auth.js';

// ── Hermes ──
export {
  StatusResultEnum,
  HermesStatusResponseSchema,
  HermesCapabilitySchema,
  HermesCapabilitiesResponseSchema,
  HermesModelSchema,
  HermesModelsResponseSchema,
  HermesSkillSchema,
  HermesSkillsResponseSchema,
  HermesToolsetSchema,
  HermesToolsetsResponseSchema,
} from './hermes.js';
export type {
  HermesStatusResponse,
  HermesCapability,
  HermesCapabilitiesResponse,
  HermesModel,
  HermesModelsResponse,
  HermesSkill,
  HermesSkillsResponse,
  HermesToolset,
  HermesToolsetsResponse,
} from './hermes.js';

// ── Sessions ──
export {
  SessionSummarySchema,
  SessionDetailSchema,
  MessageRoleEnum,
  SessionMessageSchema,
} from './sessions.js';
export type {
  SessionSummary,
  SessionDetail,
  SessionMessage,
} from './sessions.js';

// ── Jobs ──
export {
  JobStatusEnum,
  JobSummarySchema,
  JobDetailSchema,
} from './jobs.js';
export type {
  JobStatus,
  JobSummary,
  JobDetail,
} from './jobs.js';

// ── Alerts ──
export {
  AlertSeverityEnum,
  MobileAlertSchema,
  AlertsResponseSchema,
} from './alerts.js';
export type {
  AlertSeverity,
  MobileAlert,
  AlertsResponse,
} from './alerts.js';

// ── Events ──
export {
  HeartbeatEventSchema,
  MobileEventSchema,
  MobileEventUnionSchema,
} from './events.js';
export type {
  HeartbeatEvent,
  MobileEvent,
  MobileEventUnion,
} from './events.js';

// ── Errors ──
export {
  ErrorCodeEnum,
  ErrorResponseSchema,
} from './errors.js';
export type {
  ErrorCode,
  ErrorResponse,
} from './errors.js';

// ── Permissions ──
export {
  PERMISSION_SCOPES,
  PERMISSION_SCOPE_VALUES,
} from './permissions.js';
export type {
  PermissionScope,
} from './permissions.js';
