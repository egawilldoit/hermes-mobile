// ── V1 Contract: Hermes status/capabilities/models/skills/toolsets schemas ──

import { z } from 'zod';
import { VERSION_PREFIX } from './health.js';

// ── Hermes Status ──

export const StatusResultEnum = z.enum(['ok', 'degraded', 'error']);

export const HermesStatusResponseSchema = z.object({
  status: StatusResultEnum,
  platform: z.string(),
  version: z.string(),
}).describe(`${VERSION_PREFIX}_hermes_status_response`);

export type HermesStatusResponse = z.infer<typeof HermesStatusResponseSchema>;

// ── Capability ──

export const HermesCapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});
export type HermesCapability = z.infer<typeof HermesCapabilitySchema>;

export const HermesCapabilitiesResponseSchema = z.object({
  capabilities: z.array(HermesCapabilitySchema),
}).describe(`${VERSION_PREFIX}_hermes_capabilities_response`);

export type HermesCapabilitiesResponse = z.infer<typeof HermesCapabilitiesResponseSchema>;

// ── Model ──

export const HermesModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  description: z.string().optional(),
});
export type HermesModel = z.infer<typeof HermesModelSchema>;

export const HermesModelsResponseSchema = z.object({
  models: z.array(HermesModelSchema),
}).describe(`${VERSION_PREFIX}_hermes_models_response`);

export type HermesModelsResponse = z.infer<typeof HermesModelsResponseSchema>;

// ── Skill ──

export const HermesSkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
});
export type HermesSkill = z.infer<typeof HermesSkillSchema>;

export const HermesSkillsResponseSchema = z.object({
  skills: z.array(HermesSkillSchema),
}).describe(`${VERSION_PREFIX}_hermes_skills_response`);

export type HermesSkillsResponse = z.infer<typeof HermesSkillsResponseSchema>;

// ── Toolset ──

export const HermesToolsetSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
});
export type HermesToolset = z.infer<typeof HermesToolsetSchema>;

export const HermesToolsetsResponseSchema = z.object({
  toolsets: z.array(HermesToolsetSchema),
}).describe(`${VERSION_PREFIX}_hermes_toolsets_response`);

export type HermesToolsetsResponse = z.infer<typeof HermesToolsetsResponseSchema>;
