// ── Mobile-specific routes (device management, alerts) ──
// Uses canonical zod schemas from @hermes/contracts for runtime validation.

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { AppConfig } from '../lib/config.js';
import { TokenStore } from '../lib/auth.js';
import { RateLimiter, RATE_LIMIT_PRESETS } from '../lib/rate-limiter.js';
import {
  DeviceRegistrationRequestSchema,
  DeviceRegistrationResponseSchema,
  AlertsResponseSchema,
  ErrorResponseSchema,
} from '@hermes/contracts';

export function registerMobileRoutes(
  app: FastifyInstance,
  config: AppConfig,
  tokenStore: TokenStore,
  rateLimiter: RateLimiter
): void {
  // GET /v1/mobile/alerts — list alerts for the authenticated device
  app.get('/v1/mobile/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = request.authContext;
    if (!auth.authenticated) {
      reply.status(401);
      return ErrorResponseSchema.parse({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    const result = { alerts: [], device_id: auth.deviceId };
    return AlertsResponseSchema.parse(result);
  });

  // POST /v1/mobile/devices/register — register a new device
  app.post('/v1/mobile/devices/register', async (req: FastifyRequest, reply: FastifyReply) => {
    // Rate limit device registration per IP
    const ipCheck = rateLimiter.checkWindow(
      'device_registration', req.ip,
      RATE_LIMIT_PRESETS.deviceRegistration.maxRequests
    );
    if (!ipCheck.allowed) {
      reply.status(429);
      return ErrorResponseSchema.parse({
        error: 'Too many registration attempts',
        code: 'RATE_LIMITED',
        retryAfterMs: ipCheck.retryAfterMs,
      });
    }

    // Validate request body through canonical Zod schema
    const parseResult = DeviceRegistrationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      reply.status(400);
      return ErrorResponseSchema.parse({
        error: 'Invalid request body',
        code: 'REQUEST_ERROR',
      });
    }
    const body = parseResult.data;

    // In mock mode, accept any enrollment code
    if (config.hermesIntegrationMode === 'mock') {
      // Create a mock principal and device
      const principalId = `principal_mock_${Date.now()}`;
      const tokens = tokenStore.registerDevice(
        principalId,
        body.device_name,
        body.platform,
        body.push_token
      );

      const result = {
        device_id: tokens.device_id,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
        token_type: 'Bearer' as const,
      };
      return DeviceRegistrationResponseSchema.parse(result);
    }

    // Real validation would happen here (Cloudflare Access JWT → enrollment code)
    throw new Error('Device registration not available in live mode without full auth setup');
  });
}
