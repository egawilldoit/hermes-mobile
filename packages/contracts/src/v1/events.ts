// ── V1 Contract: WebSocket event schemas ──
// Event envelope, heartbeat, and event types for the mobile event stream.

import { z } from 'zod';

// ── Heartbeat Event ──

export const HeartbeatEventSchema = z.object({
  type: z.literal('heartbeat'),
  timestamp: z.string(),
});

export type HeartbeatEvent = z.infer<typeof HeartbeatEventSchema>;

// ── Mobile Event Envelope ──

export const MobileEventSchema = z.object({
  id: z.string(),
  sequence: z.number().int().nonnegative(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.string(),
});

export type MobileEvent = z.infer<typeof MobileEventSchema>;

// ── Event Union (for parsing) ──
// NOTE: z.union instead of z.discriminatedUnion because MobileEventSchema.type
// is z.string() (a generic envelope) which overlaps with HeartbeatEventSchema's
// z.literal('heartbeat') — discriminated unions require literal discriminators
// on every branch.

export const MobileEventUnionSchema = z.union([
  HeartbeatEventSchema,
  MobileEventSchema,
]);

export type MobileEventUnion = z.infer<typeof MobileEventUnionSchema>;
