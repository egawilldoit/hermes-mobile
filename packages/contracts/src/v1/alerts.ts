// ── V1 Contract: Mobile Alert schemas ──

import { z } from 'zod';

// ── Severity ──

export const AlertSeverityEnum = z.enum(['info', 'warning', 'critical']);
export type AlertSeverity = z.infer<typeof AlertSeverityEnum>;

// ── Mobile Alert ──

export const MobileAlertSchema = z.object({
  id: z.string(),
  type: z.string(),
  severity: AlertSeverityEnum,
  title: z.string(),
  body: z.string().optional(),
  read: z.boolean(),
  created_at: z.string(),
});

export type MobileAlert = z.infer<typeof MobileAlertSchema>;

// ── Alerts Response ──

export const AlertsResponseSchema = z.object({
  alerts: z.array(MobileAlertSchema),
  device_id: z.string(),
});

export type AlertsResponse = z.infer<typeof AlertsResponseSchema>;
