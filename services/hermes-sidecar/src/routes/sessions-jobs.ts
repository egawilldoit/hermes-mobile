// ── Session and Job routes ──
// Uses canonical zod schemas from @hermes/contracts for runtime validation.

import type { FastifyInstance } from 'fastify';
import type { HermesClient } from '../lib/hermes-client.js';
import {
  SessionSummarySchema,
  SessionMessageSchema,
  JobSummarySchema,
  JobDetailSchema,
  ErrorResponseSchema,
} from '@hermes/contracts';
import type { ErrorResponse } from '@hermes/contracts';

export function registerSessionRoutes(
  app: FastifyInstance,
  hermesClient: HermesClient
): void {
  // GET /v1/sessions — list all sessions
  app.get('/v1/sessions', async () => {
    const data = await hermesClient.getSessions();
    return Array.isArray(data) ? data.map(s => SessionSummarySchema.parse(s)) : data;
  });

  // GET /v1/sessions/:sessionId — single session
  app.get<{ Params: { sessionId: string } }>('/v1/sessions/:sessionId', async (req, reply) => {
    try {
      const data = await hermesClient.getSession(req.params.sessionId);
      return SessionSummarySchema.parse(data);
    } catch {
      reply.status(404);
      const err: ErrorResponse = { error: 'Session not found', code: 'NOT_FOUND' as const };
      return ErrorResponseSchema.parse(err);
    }
  });

  // GET /v1/sessions/:sessionId/messages — session messages
  app.get<{ Params: { sessionId: string } }>('/v1/sessions/:sessionId/messages', async (req) => {
    const data = await hermesClient.getSessionMessages(req.params.sessionId);
    return Array.isArray(data) ? data.map(m => SessionMessageSchema.parse(m)) : data;
  });
}

export function registerJobRoutes(
  app: FastifyInstance,
  hermesClient: HermesClient
): void {
  // GET /v1/jobs — list all jobs
  app.get('/v1/jobs', async () => {
    const data = await hermesClient.getJobs();
    return Array.isArray(data) ? data.map(j => JobSummarySchema.parse(j)) : data;
  });

  // GET /v1/jobs/:jobId — single job
  app.get<{ Params: { jobId: string } }>('/v1/jobs/:jobId', async (req) => {
    const data = await hermesClient.getJob(req.params.jobId);
    return JobDetailSchema.parse(data);
  });
}
