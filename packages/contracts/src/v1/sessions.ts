// ── V1 Contract: Session schemas ──

import { z } from 'zod/v4';
import { VERSION_PREFIX } from './health.js';

// ── Session Summary ──

export const SessionSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  message_count: z.number().int().nonnegative().optional(),
}).describe(`${VERSION_PREFIX}_session_summary`);

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// ── Session Detail ──

export const SessionDetailSchema = SessionSummarySchema.extend({
}).describe(`${VERSION_PREFIX}_session_detail`);

export type SessionDetail = z.infer<typeof SessionDetailSchema>;

// ── Session Message ──

export const MessageRoleEnum = z.enum(['user', 'assistant', 'system']);

export const SessionMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleEnum,
  content: z.string(),
  created_at: z.string(),
}).describe(`${VERSION_PREFIX}_session_message`);

export type SessionMessage = z.infer<typeof SessionMessageSchema>;
