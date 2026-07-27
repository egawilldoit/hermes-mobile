// ── Schema-driven Hermes Mobile API Client ──
// All network responses are validated against run-time Zod schemas from @hermes/contracts.
// Non-2xx responses are normalized through ErrorResponseSchema and thrown as typed errors.
// No `as T` cast at the external boundary — every response is parsed at runtime.

import { z } from '@hermes/contracts';
import type { ZodType } from '@hermes/contracts';
import {
  HealthResponseSchema,
  ReadinessResponseSchema,
  DeviceRegistrationResponseSchema,
  TokenRefreshResponseSchema,
  DeviceRevocationResponseSchema,
  HermesCapabilitiesResponseSchema,
  HermesModelsResponseSchema,
  HermesSkillsResponseSchema,
  HermesToolsetsResponseSchema,
  SessionSummarySchema,
  SessionMessageSchema,
  JobSummarySchema,
  AlertsResponseSchema,
  ErrorResponseSchema,
} from '@hermes/contracts';
import type {
  HealthResponse,
  ReadinessResponse,
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  RefreshTokenRequest,
  TokenRefreshResponse,
  DeviceRevocationResponse,
  SessionSummary,
  SessionMessage,
  JobSummary,
} from '@hermes/contracts';

const DEFAULT_BASE_URL = 'http://127.0.0.1:18790';

// ── Typed API Error ──
// Never exposes raw server payloads. Sanitised message, stable code, status, and optional retry.

export class HermesApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly retryAfterMs?: number;

  constructor(code: string, message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.name = 'HermesApiError';
    this.code = code;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

export class HermesMobileClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // ── Core request method ──
  // Accepts a response Zod schema and validates every response through it.
  // Non-2xx responses are parsed with ErrorResponseSchema; non-JSON or malformed
  // payloads produce a deterministic UPSTREAM_ERROR.

  private async request<T>(
    path: string,
    responseSchema: ZodType<T>,
    options?: {
      method?: string;
      body?: unknown;
      noAuth?: boolean;
    },
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!options?.noAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const rawBody = await response.text();

    if (!response.ok) {
      return this.handleErrorResponse(rawBody, response.status);
    }

    // Success path — parse against the caller-provided response schema
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new HermesApiError('UPSTREAM_ERROR', 'Non-JSON success response', response.status);
    }

    return responseSchema.parse(parsed);
  }

  // ── Normalised error handling ──
  // Parses non-2xx body with ErrorResponseSchema. Preserves code, retryAfterMs, status.
  // Never exposes raw server payloads. Handles invalid JSON and invalid error payloads deterministically.

  private handleErrorResponse(rawBody: string, status: number): never {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new HermesApiError('UPSTREAM_ERROR', 'Non-JSON error response', status);
    }

    const errorResult = ErrorResponseSchema.safeParse(parsed);

    if (errorResult.success) {
      const { code, error: message, retryAfterMs } = errorResult.data;
      throw new HermesApiError(code, message, status, retryAfterMs);
    }

    // Body was JSON but did not match the canonical error shape
    throw new HermesApiError('UPSTREAM_ERROR', 'Invalid error response', status);
  }

  // ── Public endpoints ──

  async getHealth(): Promise<HealthResponse> {
    return this.request('/v1/health', HealthResponseSchema, { noAuth: true });
  }

  async getReadiness(): Promise<ReadinessResponse> {
    return this.request('/v1/ready', ReadinessResponseSchema, { noAuth: true });
  }

  // ── Auth ──

  async registerDevice(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    return this.request('/v1/mobile/devices/register', DeviceRegistrationResponseSchema, {
      method: 'POST',
      body: req,
      noAuth: true,
    });
  }

  async refreshToken(req: RefreshTokenRequest): Promise<TokenRefreshResponse> {
    return this.request('/v1/mobile/token/refresh', TokenRefreshResponseSchema, {
      method: 'POST',
      body: req,
      noAuth: true,
    });
  }

  async revokeDevice(deviceId: string): Promise<DeviceRevocationResponse> {
    return this.request(`/v1/mobile/devices/${deviceId}`, DeviceRevocationResponseSchema, {
      method: 'DELETE',
    });
  }

  // ── Hermes info ──

  async getCapabilities(): Promise<z.infer<typeof HermesCapabilitiesResponseSchema>> {
    return this.request('/v1/hermes/capabilities', HermesCapabilitiesResponseSchema);
  }

  async getModels(): Promise<z.infer<typeof HermesModelsResponseSchema>> {
    return this.request('/v1/hermes/models', HermesModelsResponseSchema);
  }

  async getSkills(): Promise<z.infer<typeof HermesSkillsResponseSchema>> {
    return this.request('/v1/hermes/skills', HermesSkillsResponseSchema);
  }

  async getToolsets(): Promise<z.infer<typeof HermesToolsetsResponseSchema>> {
    return this.request('/v1/hermes/toolsets', HermesToolsetsResponseSchema);
  }

  // ── Sessions ──

  async getSessions(): Promise<SessionSummary[]> {
    return this.request('/v1/sessions', z.array(SessionSummarySchema));
  }

  async getSession(sessionId: string): Promise<SessionSummary> {
    return this.request(`/v1/sessions/${sessionId}`, SessionSummarySchema);
  }

  async getSessionMessages(sessionId: string): Promise<SessionMessage[]> {
    return this.request(`/v1/sessions/${sessionId}/messages`, z.array(SessionMessageSchema));
  }

  // ── Jobs ──

  async getJobs(): Promise<JobSummary[]> {
    return this.request('/v1/jobs', z.array(JobSummarySchema));
  }

  // ── Alerts ──

  async getAlerts(): Promise<z.infer<typeof AlertsResponseSchema>> {
    return this.request('/v1/mobile/alerts', AlertsResponseSchema);
  }
}
