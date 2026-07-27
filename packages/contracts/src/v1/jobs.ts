// ── V1 Contract: Job schemas ──

import { z } from 'zod';

// ── Job Status ──

export const JobStatusEnum = z.enum(['active', 'paused', 'completed', 'failed']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

// ── Job Summary ──

export const JobSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  schedule: z.string(),
  status: JobStatusEnum,
  last_run: z.string().optional(),
  next_run: z.string().optional(),
});

export type JobSummary = z.infer<typeof JobSummarySchema>;

// ── Job Detail ──

export const JobDetailSchema = JobSummarySchema.extend({
});

export type JobDetail = z.infer<typeof JobDetailSchema>;
