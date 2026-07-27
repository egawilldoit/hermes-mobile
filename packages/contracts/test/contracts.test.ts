// ── Contract Schema Validation Tests ──
// Tests that the versioned zod schemas accept valid payloads and reject invalid ones.

import { describe, it, expect } from 'vitest';
import {
  HealthResponseSchema,
  ReadinessResponseSchema,
  DeviceRegistrationRequestSchema,
  DeviceRegistrationResponseSchema,
  RefreshTokenRequestSchema,
  TokenRefreshResponseSchema,
  DeviceRevocationResponseSchema,
  HermesStatusResponseSchema,
  HermesCapabilitiesResponseSchema,
  HermesModelsResponseSchema,
  SessionSummarySchema,
  SessionMessageSchema,
  JobSummarySchema,
  JobDetailSchema,
  MobileAlertSchema,
  AlertsResponseSchema,
  MobileEventSchema,
  ErrorResponseSchema,
} from '../src/v1/index.js';

describe('Health schemas', () => {
  it('accepts a valid health response', () => {
    const result = HealthResponseSchema.parse({
      status: 'ok',
      version: '0.1.0',
      uptime: 123,
      timestamp: '2026-07-27T12:00:00Z',
      mode: 'mock',
    });
    expect(result.status).toBe('ok');
  });

  it('rejects an invalid status', () => {
    expect(() => HealthResponseSchema.parse({
      status: 'unknown',
      version: '0.1.0',
      uptime: 123,
      timestamp: '2026-07-27T12:00:00Z',
      mode: 'mock',
    })).toThrow();
  });

  it('accepts all valid status values', () => {
    for (const status of ['ok', 'degraded', 'error'] as const) {
      expect(() => HealthResponseSchema.parse({
        status, version: '0.1.0', uptime: 0, timestamp: new Date().toISOString(), mode: 'mock',
      })).not.toThrow();
    }
  });
});

describe('Auth schemas', () => {
  it('accepts valid device registration request', () => {
    const result = DeviceRegistrationRequestSchema.parse({
      enrollment_code: 'abc123',
      device_name: 'Samsung S25',
      platform: 'android',
    });
    expect(result.platform).toBe('android');
  });

  it('accepts registration with optional push token', () => {
    const result = DeviceRegistrationRequestSchema.parse({
      enrollment_code: 'abc123',
      device_name: 'Samsung S25',
      platform: 'android',
      push_token: 'ExponentPushToken[xxxx]',
    });
    expect(result.push_token).toBe('ExponentPushToken[xxxx]');
  });

  it('rejects invalid platform', () => {
    expect(() => DeviceRegistrationRequestSchema.parse({
      enrollment_code: 'abc123',
      device_name: 'Samsung S25',
      platform: 'windows',
    })).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => DeviceRegistrationRequestSchema.parse({
      enrollment_code: 'abc123',
    })).toThrow();
  });

  it('accepts valid device registration response', () => {
    const result = DeviceRegistrationResponseSchema.parse({
      device_id: 'dev_001',
      access_token: 'eyJ...',
      refresh_token: 'rt_abc',
      expires_in: 600,
      token_type: 'Bearer',
    });
    expect(result.token_type).toBe('Bearer');
  });

  it('rejects invalid token_type', () => {
    expect(() => DeviceRegistrationResponseSchema.parse({
      device_id: 'dev_001',
      access_token: 'eyJ...',
      refresh_token: 'rt_abc',
      expires_in: 600,
      token_type: 'Basic',
    })).toThrow();
  });

  it('accepts valid refresh token request', () => {
    const result = RefreshTokenRequestSchema.parse({
      refresh_token: 'rt_abc',
    });
    expect(result.refresh_token).toBe('rt_abc');
  });

  it('accepts valid device revocation response', () => {
    const result = DeviceRevocationResponseSchema.parse({
      success: true,
      device_id: 'dev_001',
      revoked_at: '2026-07-27T12:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('Hermes info schemas', () => {
  it('accepts a valid status response', () => {
    const result = HermesStatusResponseSchema.parse({
      status: 'ok',
      platform: 'linux',
      version: '0.19.0',
    });
    expect(result.status).toBe('ok');
  });

  it('accepts valid capabilities response', () => {
    const result = HermesCapabilitiesResponseSchema.parse({
      capabilities: [
        { id: 'chat', name: 'Chat', description: 'Chat with Hermes', enabled: true },
      ],
    });
    expect(result.capabilities).toHaveLength(1);
  });

  it('accepts valid models response', () => {
    const result = HermesModelsResponseSchema.parse({
      models: [
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
      ],
    });
    expect(result.models[0]?.name).toBe('GPT-4');
  });

  it('rejects empty capabilities', () => {
    expect(() => HermesCapabilitiesResponseSchema.parse({})).toThrow();
  });
});

describe('Session schemas', () => {
  it('accepts valid session summary', () => {
    const result = SessionSummarySchema.parse({
      id: 'sess_001',
      title: 'Debug auth',
      created_at: '2026-07-27T12:00:00Z',
      updated_at: '2026-07-27T13:00:00Z',
    });
    expect(result.id).toBe('sess_001');
  });

  it('accepts session with message_count', () => {
    const result = SessionSummarySchema.parse({
      id: 'sess_001',
      title: 'Debug auth',
      created_at: '2026-07-27T12:00:00Z',
      updated_at: '2026-07-27T13:00:00Z',
      message_count: 5,
    });
    expect(result.message_count).toBe(5);
  });

  it('accepts valid session message', () => {
    const result = SessionMessageSchema.parse({
      id: 'msg_001',
      role: 'user',
      content: 'Hello',
      created_at: '2026-07-27T12:00:00Z',
    });
    expect(result.content).toBe('Hello');
  });

  it('rejects invalid role', () => {
    expect(() => SessionMessageSchema.parse({
      id: 'msg_001',
      role: 'bot',
      content: 'Hello',
      created_at: '2026-07-27T12:00:00Z',
    })).toThrow();
  });
});

describe('Job schemas', () => {
  it('accepts valid job summary', () => {
    const result = JobSummarySchema.parse({
      id: 'job_001',
      name: 'Daily backup',
      schedule: '0 2 * * *',
      status: 'active',
    });
    expect(result.name).toBe('Daily backup');
  });

  it('rejects invalid job status', () => {
    expect(() => JobSummarySchema.parse({
      id: 'job_001',
      name: 'Daily backup',
      schedule: '0 2 * * *',
      status: 'broken',
    })).toThrow();
  });
});

describe('Alert schemas', () => {
  it('accepts valid alert', () => {
    const result = MobileAlertSchema.parse({
      id: 'alert_001',
      type: 'run_failed',
      severity: 'critical',
      title: 'Run failed',
      body: 'Chat run failed with error',
      read: false,
      created_at: '2026-07-27T12:00:00Z',
    });
    expect(result.severity).toBe('critical');
  });

  it('accepts valid alerts response', () => {
    const result = AlertsResponseSchema.parse({
      alerts: [],
      device_id: 'dev_001',
    });
    expect(result.alerts).toHaveLength(0);
  });
});

describe('Event schema', () => {
  it('accepts valid mobile event', () => {
    const result = MobileEventSchema.parse({
      id: 'evt_5_a1b2c3d4',
      sequence: 5,
      type: 'run_update',
      data: { run_id: 'run_1', status: 'running' },
      timestamp: '2026-07-27T12:00:00Z',
    });
    expect(result.sequence).toBe(5);
  });
});

describe('Error schema', () => {
  it('accepts valid error response', () => {
    const result = ErrorResponseSchema.parse({
      error: 'Not found',
      code: 'NOT_FOUND',
    });
    expect(result.code).toBe('NOT_FOUND');
  });

  it('rejects unknown error code', () => {
    expect(() => ErrorResponseSchema.parse({
      error: 'Something weird',
      code: 'UNKNOWN_ERROR',
    })).toThrow();
  });
});

describe('Compatibility', () => {
  it('strips unknown fields by default (zod v4 default behavior)', () => {
    const result = HealthResponseSchema.parse({
      status: 'ok',
      version: '0.1.0',
      uptime: 123,
      timestamp: '2026-07-27T12:00:00Z',
      mode: 'mock',
      extraField: 'should be stripped by default',
    });
    expect(result.status).toBe('ok');
    expect((result as any).extraField).toBeUndefined();
  });

  it('produces correct inferred types', () => {
    // Type-level check: z.infer should work
    type T = typeof HealthResponseSchema;
    const check: T extends { parse: (input: unknown) => infer O } ? O : never = {} as never;
    // Runtime: parse produces correct shape
    const parsed = HealthResponseSchema.parse({
      status: 'ok',
      version: '1.0',
      uptime: 100,
      timestamp: 'now',
      mode: 'mock',
    });
    expect(parsed.mode).toBe('mock');
  });
});
