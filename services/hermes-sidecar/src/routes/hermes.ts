// ── Hermes status/info routes ──
// Uses canonical zod schemas from @hermes/contracts for runtime validation.

import type { FastifyInstance } from 'fastify';
import type { HermesClient } from '../lib/hermes-client.js';
import type { AppConfig } from '../lib/config.js';
import {
  HermesStatusResponseSchema,
  HermesCapabilitiesResponseSchema,
  HermesModelsResponseSchema,
  HermesSkillsResponseSchema,
  HermesToolsetsResponseSchema,
} from '@hermes/contracts';
import type {
  HermesStatusResponse,
  HermesCapabilitiesResponse,
  HermesModelsResponse,
  HermesSkillsResponse,
  HermesToolsetsResponse,
} from '@hermes/contracts';

export function registerHermesRoutes(
  app: FastifyInstance,
  config: AppConfig,
  hermesClient: HermesClient
): void {
  // GET /v1/hermes/status — Hermes Gateway health
  app.get('/v1/hermes/status', async () => {
    const health = await hermesClient.getHealth();
    return HermesStatusResponseSchema.parse(health);
  });

  // GET /v1/hermes/capabilities
  app.get('/v1/hermes/capabilities', async () => {
    const data = await hermesClient.getCapabilities();
    return HermesCapabilitiesResponseSchema.parse(data);
  });

  // GET /v1/hermes/models
  app.get('/v1/hermes/models', async () => {
    const data = await hermesClient.getModels();
    return HermesModelsResponseSchema.parse(data);
  });

  // GET /v1/hermes/skills
  app.get('/v1/hermes/skills', async () => {
    const data = await hermesClient.getSkills();
    return HermesSkillsResponseSchema.parse(data);
  });

  // GET /v1/hermes/toolsets
  app.get('/v1/hermes/toolsets', async () => {
    const data = await hermesClient.getToolsets();
    return HermesToolsetsResponseSchema.parse(data);
  });
}
