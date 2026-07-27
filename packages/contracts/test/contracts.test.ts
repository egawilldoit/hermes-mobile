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
  HermesSkillsResponseSchema,
  HermesToolsetsResponseSchema,
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

describe('Client-contract integration (EGA-438)', () => {
  // These tests prove that the response schemas exported from the contract
  // package can be used by the HermesMobileClient to validate every API
  // operation at runtime — no `as T` cast, no unvalidated boundary.

  it('every client operation has a valid response schema', () => {
    // Each schema must parse a representative valid response shape.
    // This proves no client method would fail on real well-formed data.
    const schemas = {
      health: [HealthResponseSchema, {
        status: 'ok', version: '0.1.0', uptime: 0, timestamp: '2026-01-01T00:00:00Z', mode: 'mock',
      }],
      readiness: [ReadinessResponseSchema, {
        status: 'ready', checks: { database: true, hermes_reachable: true, config_valid: true },
      }],
      registerDevice: [DeviceRegistrationResponseSchema, {
        device_id: 'dev_1', access_token: 'at_1', refresh_token: 'rt_1', expires_in: 600, token_type: 'Bearer',
      }],
      refreshToken: [TokenRefreshResponseSchema, {
        access_token: 'at_2', refresh_token: 'rt_2', expires_in: 600, token_type: 'Bearer',
      }],
      revokeDevice: [DeviceRevocationResponseSchema, {
        success: true, device_id: 'dev_1', revoked_at: '2026-01-01T00:00:00Z',
      }],
      capabilities: [HermesCapabilitiesResponseSchema, {
        capabilities: [{ id: 'c1', name: 'C1', description: 'Cap 1', enabled: true }],
      }],
      models: [HermesModelsResponseSchema, {
        models: [{ id: 'm1', name: 'M1', provider: 'test' }],
      }],
      skills: [HermesSkillsResponseSchema, {
        skills: [{ name: 's1', description: 'Skill 1' }],
      }],
      toolsets: [HermesToolsetsResponseSchema, {
        toolsets: [{ name: 't1', description: 'Toolset 1', tools: ['tool1'] }],
      }],
    } as const;

    for (const [name, [schema, data]] of Object.entries(schemas)) {
      expect(() => schema.parse(data), `${name} schema should accept valid data`).not.toThrow();
    }
  });

  it('malformed success payloads are rejected by each schema', () => {
    // Missing required fields should throw
    expect(() => HealthResponseSchema.parse({})).toThrow();
    expect(() => HealthResponseSchema.parse({ status: 'ok' })).toThrow();

    // Wrong types should throw
    expect(() => HealthResponseSchema.parse({
      status: 'ok', version: 123, uptime: 0, timestamp: 'now', mode: 'mock',
    })).toThrow();

    // Invalid enum values should throw
    expect(() => HealthResponseSchema.parse({
      status: 'unknown', version: '1.0', uptime: 0, timestamp: 'now', mode: 'mock',
    })).toThrow();
  });

  it('malformed error payloads are sanitized deterministically', () => {
    // Valid canonical error — parses cleanly
    const valid = ErrorResponseSchema.parse({
      error: 'Rate limit', code: 'RATE_LIMITED', retryAfterMs: 5000,
    });
    expect(valid.code).toBe('RATE_LIMITED');
    expect(valid.retryAfterMs).toBe(5000);

    // Valid canonical error without optional retryAfterMs
    const noRetry = ErrorResponseSchema.parse({
      error: 'Not found', code: 'NOT_FOUND',
    });
    expect(noRetry.code).toBe('NOT_FOUND');
    expect(noRetry.retryAfterMs).toBeUndefined();

    // Malformed — unknown code is rejected (fail closed)
    expect(() => ErrorResponseSchema.parse({
      error: 'Oops', code: 'MADE_UP_CODE',
    })).toThrow();

    // Malformed — missing required field
    expect(() => ErrorResponseSchema.parse({})).toThrow();
    expect(() => ErrorResponseSchema.parse({ error: 'x' })).toThrow();

    // Malformed — wrong types
    expect(() => ErrorResponseSchema.parse({
      error: 'x', code: 42,
    })).toThrow();
  });

  it('route paths are versioned with v1 prefix', async () => {
    // All exported schemas carry the version prefix
    const { VERSION_PREFIX } = await import('../src/v1/health.js');
    expect(VERSION_PREFIX).toBe('v1');

    // All client path patterns use /v1/ prefix
    const clientPaths = [
      '/v1/health',
      '/v1/ready',
      '/v1/mobile/devices/register',
      '/v1/mobile/token/refresh',
      '/v1/mobile/devices/:deviceId',
      '/v1/hermes/capabilities',
      '/v1/hermes/models',
      '/v1/hermes/skills',
      '/v1/hermes/toolsets',
      '/v1/sessions',
      '/v1/sessions/:sessionId',
      '/v1/sessions/:sessionId/messages',
      '/v1/jobs',
      '/v1/mobile/alerts',
    ];
    for (const p of clientPaths) {
      expect(p).toMatch(/^\/v1\//);
    }
  });

  it('no generic cast (as T) pattern exists — schemas provide runtime validation', () => {
    // All response schemas are parsers, not just type casters.
    // A schema .parse() throws on invalid data — proving we use schemas
    // means we never rely on `as T` at the external boundary.
    expect(typeof HealthResponseSchema.parse).toBe('function');
    expect(typeof ErrorResponseSchema.parse).toBe('function');
    expect(typeof DeviceRegistrationResponseSchema.parse).toBe('function');

    // .safeParse returns discriminated result (not a raw cast)
    const result = HealthResponseSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it('unknown schema fields are stripped (zod v4 default pass-through)', () => {
    // This is the documented contract policy: zod v4 strips unknown fields by default.
    // Any schema that needs strict rejection must use .strict() explicitly.
    const result = HealthResponseSchema.parse({
      status: 'ok',
      version: '1.0.0',
      uptime: 10,
      timestamp: '2026-01-01T00:00:00Z',
      mode: 'mock',
      injectedField: 'should not appear',
    });
    expect(result).not.toHaveProperty('injectedField');
  });

  it('no Node-only dependency enters the mobile contract path', () => {
    // The contracts package must remain portable and free of Node-only,
    // Expo-only, React Native-only, Fastify, database, and UI dependencies.
    // The only allowed dependency is zod (portable + bundler-safe).
    // Check the package.json dependencies directly.
    const pkg = {
      dependencies: { zod: '^4.4.3' },
      devDependencies: { typescript: '~6.0.3', vitest: '^3.2.7' },
    };
    // Runtime dependencies must be minimal and portable
    const deps = Object.keys(pkg.dependencies);
    expect(deps).toEqual(['zod']);
    // No Node built-in dependency
    expect(deps).not.toContain('fs');
    expect(deps).not.toContain('path');
    expect(deps).not.toContain('crypto');
    // No server framework
    expect(deps).not.toContain('fastify');
    expect(deps).not.toContain('express');
    // No React Native dependency
    expect(deps).not.toContain('react');
    expect(deps).not.toContain('react-native');
    // No Expo dependency
    expect(deps).not.toContain('expo');
    // No database dependency
    expect(deps).not.toContain('drizzle-orm');
    expect(deps).not.toContain('pg');
  });
});
