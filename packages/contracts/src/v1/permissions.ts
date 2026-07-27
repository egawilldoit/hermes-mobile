// ── V1 Contract: Permission scopes ──
// Permission scope names as const + TypeScript type.

export const PERMISSION_SCOPES = {
  READ: 'read',
  WRITE: 'write',
  MOBILE: 'mobile',
  ADMIN: 'admin',
} as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[keyof typeof PERMISSION_SCOPES];

export const PERMISSION_SCOPE_VALUES = Object.values(PERMISSION_SCOPES);
