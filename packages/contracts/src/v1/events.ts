// ── V1 Contract: WebSocket event schemas ──
// Event envelope, heartbeat, and event types for the mobile event stream.

import { z } from 'zod';
import { VERSION_PREFIX } from './health.js';

// ── Heartbeat Event ──

export const HeartbeatEventSchema = z.object({
  type: z.literal('heartbeat'),
  timestamp: z.string(),
}).describe(`${VERSION_PREFIX}_heartbeat_event`);

export type HeartbeatEvent = z.infer<typeof HeartbeatEventSchema>;

// ── Mobile Event Envelope ──

export const MobileEventSchema = z.object({
  id: z.string(),
  sequence: z.number().int().nonnegative(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.string(),
}).describe(`${VERSION_PREFIX}_mobile_event`);

export type MobileEvent = z.infer<typeof MobileEventSchema>;

// ── Event Union (for discriminated parsing) ──

export const MobileEventUnionSchema = z.discriminatedUnion('type', [
  HeartbeatEventSchema,
  MobileEventSchema,
]).describe(`${VERSION_PREFIX}_mobile_event_union`);

export type MobileEventUnion = z.infer<typeof MobileEventUnionSchema>;
