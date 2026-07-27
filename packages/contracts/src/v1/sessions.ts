// ── V1 Contract: Session schemas ──

import { z } from 'zod';

// ── Session Summary ──

export const SessionSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  message_count: z.number().int().nonnegative().optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// ── Session Detail ──

export const SessionDetailSchema = SessionSummarySchema.extend({
});

export type SessionDetail = z.infer<typeof SessionDetailSchema>;

// ── Session Message ──

export const MessageRoleEnum = z.enum(['user', 'assistant', 'system']);

export const SessionMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleEnum,
  content: z.string(),
  created_at: z.string(),
});

export type SessionMessage = z.infer<typeof SessionMessageSchema>;
