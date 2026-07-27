// ── Application smoke / navigation tests ──
//
// These tests validate that the mobile app's utility layer and navigation
// structure are healthy.  They run without a React Native runtime (vitest
// in node environment), so they target pure-logic modules that are
// meaningful to application behaviour.

import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/utils';

// ── Utility: cn() class merging ─────────────────────────────────────
//
// cn() is the central class-name utility used by every component.
// It delegates to clsx + tailwind-merge, so testing it validates that
// both are installed and work correctly together.

describe('cn utility', () => {
  it('concatenates simple classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes (falsy values omitted)', () => {
    const result = cn('base', false && 'hidden', undefined, null, 'visible');
    expect(result).toBe('base visible');
  });

  it('resolves conflicting Tailwind classes (last variant wins)', () => {
    // tailwind-merge should keep only the last of conflicting utilities
    const merged = cn('px-4', 'px-2');
    expect(merged).toBe('px-2');
  });

  it('resolves conflicting colour variants', () => {
    const merged = cn('text-red-500', 'text-blue-700');
    expect(merged).toBe('text-blue-700');
  });

  it('preserves non-conflicting classes', () => {
    const merged = cn('flex', 'items-center', 'justify-between', 'p-4');
    expect(merged).toBe('flex items-center justify-between p-4');
  });

  it('accepts arrays of class names', () => {
    const result = cn(['a', 'b'], 'c');
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
  });
});

// ── Navigation structure ────────────────────────────────────────────
//
// Validate that the app's route entry points are importable without
// error.  This exercises the module graph through TypeScript resolution
// and checks that every named export referenced by the router exists.
// Import failures propagate as uncaught errors — no try/catch wrapping.

describe('app navigation structure', () => {
  it('_layout.tsx can be imported (theme + portal + stack)', async () => {
    // Direct import — must throw on structural problems.  No try/catch.
    const mod = await import('../_layout');
    expect(typeof mod.default).toBe('function');
    expect(mod.ErrorBoundary).toBeDefined();
  });

  it('index route is importable', async () => {
    const mod = await import('../index');
    expect(mod.default).toBeDefined();
  });

  it('+not-found route is importable', async () => {
    const mod = await import('../+not-found');
    expect(mod.default).toBeDefined();
  });

  it('broken import must fail (no silent error swallowing)', async () => {
    // This intentionally imports a nonexistent module to verify that
    // import errors are NOT silently swallowed by the test harness.
    // @ts-expect-error — this module intentionally does not exist
    await expect(import('./does-not-exist')).rejects.toThrow();
  });
});
