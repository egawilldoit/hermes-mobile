// ── Application smoke / navigation tests ──
//
// These tests validate that the mobile app's utility layer and navigation
// structure are healthy.  They run without a React Native runtime (vitest
// in node environment), so utility-only tests run natively and navigation
// structure is validated at the file-system level.
//
// React Native route component files cannot be imported in Node without
// Metro/Framework transform plugins.  Instead we verify route structure
// by checking that expected route entry points exist as files.
//
// Import failures propagate as uncaught errors — no try/catch wrapping.

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
// Route entry-point verification is done at the file-system level:
// we check Expo Router convention files exist.  This proves the
// navigation structure was scaffolded without needing a React Native
// bundler transform.

describe('app navigation structure', () => {
  // Resolve the app directory relative to this test file
  const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

  it('root layout file exists (_layout.tsx)', () => {
    expect(existsSync(resolve(appDir, '_layout.tsx'))).toBe(true);
  });

  it('index route file exists (index.tsx)', () => {
    expect(existsSync(resolve(appDir, 'index.tsx'))).toBe(true);
  });

  it('+not-found route file exists', () => {
    expect(existsSync(resolve(appDir, '+not-found.tsx'))).toBe(true);
  });

  it('broken import must fail (no silent error swallowing)', async () => {
    // This intentionally imports a nonexistent module to verify that
    // import errors are NOT silently swallowed by the test harness.
    // @ts-expect-error — this module intentionally does not exist
    await expect(import('./does-not-exist')).rejects.toThrow();
  });
});
