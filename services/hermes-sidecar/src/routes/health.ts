// ── Health & Readiness routes (no auth required) ──
// Uses canonical zod schemas from @hermes/contracts for runtime validation.

import type { FastifyInstance } from 'fastify';
import type { HermesClient } from '../lib/hermes-client.js';
import type { AppConfig } from '../lib/config.js';
import { HealthResponseSchema, ReadinessResponseSchema } from '@hermes/contracts';
import type { HealthResponse, ReadinessResponse } from '@hermes/contracts';

const startTime = Date.now();

export function registerHealthRoutes(
  app: FastifyInstance,
  config: AppConfig,
  hermesClient: HermesClient
): void {
  // GET /health — liveness probe
  app.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            timestamp: { type: 'string' },
            mode: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    const reply: HealthResponse = {
      status: 'ok',
      version: '0.1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      mode: config.hermesIntegrationMode,
    };
    // Runtime-validate the response against the canonical contract
    return HealthResponseSchema.parse(reply);
  });

  // GET /ready — readiness probe (checks dependencies)
  app.get('/ready', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            checks: {
              type: 'object',
              properties: {
                database: { type: 'boolean' },
                hermes_reachable: { type: 'boolean' },
                config_valid: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async () => {
    let hermesReachable = false;
    try {
      const health = await hermesClient.getHealth();
      hermesReachable = health.status === 'ok';
    } catch {
      hermesReachable = false;
    }

    // Database check — in mock mode, skip
    const databaseOk = config.databaseMode === 'test' ? true : false;

    const reply: ReadinessResponse = {
      status: hermesReachable ? 'ready' : 'not_ready',
      checks: {
        database: databaseOk,
        hermes_reachable: hermesReachable,
        config_valid: true,
      },
    };
    // Runtime-validate the response against the canonical contract
    return ReadinessResponseSchema.parse(reply);
  });
}
