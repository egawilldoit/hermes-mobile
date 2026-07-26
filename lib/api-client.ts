// ── Mock Hermes Mobile API Client ──
// Connects to the sidecar's mock endpoints.
// In dev, uses http://127.0.0.1:18790
// On physical Android, 127.0.0.1 points to the phone, not the VM — use 10.0.2.2 for emulator.

import type {
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
  ErrorResponse,
} from '@hermes/contracts';

const DEFAULT_BASE_URL = 'http://127.0.0.1:18790';

export class HermesMobileClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(path: string, options?: {
    method?: string;
    body?: unknown;
    noAuth?: boolean;
  }): Promise<T> {
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

    const data = await response.json();
    return data as T;
  }

  // ── Public endpoints ──

  async getHealth(): Promise<HealthResponse> {
    return this.request('/health', { noAuth: true });
  }

  async getReadiness(): Promise<ReadinessResponse> {
    return this.request('/ready', { noAuth: true });
  }

  // ── Auth ──

  async registerDevice(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    return this.request('/v1/mobile/devices/register', {
      method: 'POST',
      body: req,
      noAuth: true,
    });
  }

  async refreshToken(req: RefreshTokenRequest): Promise<TokenRefreshResponse> {
    return this.request('/v1/mobile/token/refresh', {
      method: 'POST',
      body: req,
      noAuth: true,
    });
  }

  async revokeDevice(deviceId: string): Promise<DeviceRevocationResponse> {
    return this.request(`/v1/mobile/devices/${deviceId}`, { method: 'DELETE' });
  }

  // ── Hermes info ──

  async getCapabilities(): Promise<{ capabilities: HermesCapability[] }> {
    return this.request('/v1/hermes/capabilities');
  }

  async getModels(): Promise<{ models: HermesModel[] }> {
    return this.request('/v1/hermes/models');
  }

  async getSkills(): Promise<{ skills: HermesSkill[] }> {
    return this.request('/v1/hermes/skills');
  }

  async getToolsets(): Promise<{ toolsets: HermesToolset[] }> {
    return this.request('/v1/hermes/toolsets');
  }

  // ── Sessions ──

  async getSessions(): Promise<SessionSummary[]> {
    return this.request('/v1/sessions');
  }

  async getSession(sessionId: string): Promise<SessionSummary> {
    return this.request(`/v1/sessions/${sessionId}`);
  }

  async getSessionMessages(sessionId: string): Promise<SessionMessage[]> {
    return this.request(`/v1/sessions/${sessionId}/messages`);
  }

  // ── Jobs ──

  async getJobs(): Promise<JobSummary[]> {
    return this.request('/v1/jobs');
  }

  // ── Alerts ──

  async getAlerts(): Promise<{ alerts: MobileAlert[]; device_id: string }> {
    return this.request('/v1/mobile/alerts');
  }
}
