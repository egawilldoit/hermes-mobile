// ── Shared contracts between Hermes Mobile app and sidecar ──
// Portable TypeScript types only — no runtime dependencies.
// No Fastify, no Node, no Expo, no React Native imports.

// ── Auth ──

export interface DeviceRegistrationRequest {
  enrollment_code: string;
  device_name: string;
  platform: 'android' | 'ios';
  push_token?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface DeviceRegistrationResponse extends TokenResponse {
  device_id: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenRefreshResponse extends TokenResponse {}

export interface DeviceRevocationResponse {
  success: boolean;
  device_id: string;
  revoked_at: string;
}

// ── Health ──

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  timestamp: string;
  mode: 'mock' | 'live';
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  checks: {
    database: boolean;
    hermes_reachable: boolean;
    config_valid: boolean;
  };
}

// ── Hermes Status ──

export interface HermesCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface HermesModel {
  id: string;
  name: string;
  provider: string;
}

export interface HermesSkill {
  name: string;
  description: string;
  category?: string;
}

export interface HermesToolset {
  name: string;
  description: string;
  tools: string[];
}

// ── Sessions ──

export interface SessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// ── Jobs ──

export interface JobSummary {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  last_run?: string;
  next_run?: string;
}

// ── Alerts ──

export interface MobileAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
}

// ── WebSocket Events ──

export interface MobileEvent {
  id: string;
  sequence: number;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface HeartbeatEvent {
  type: 'heartbeat';
  timestamp: string;
}

// ── Error ──

export interface ErrorResponse {
  error: string;
  code: 'AUTH_REQUIRED' | 'INVALID_TOKEN' | 'DEVICE_REVOKED' | 'FORBIDDEN'
       | 'RATE_LIMITED' | 'NOT_FOUND' | 'UPSTREAM_ERROR' | 'REQUEST_ERROR'
       | 'INVALID_REFRESH_TOKEN' | 'TOKEN_THEFT_DETECTED';
}

// ── Permission Scopes ──

export const PERMISSION_SCOPES = {
  READ: 'read',
  WRITE: 'write',
  MOBILE: 'mobile',
  ADMIN: 'admin',
} as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[keyof typeof PERMISSION_SCOPES];
