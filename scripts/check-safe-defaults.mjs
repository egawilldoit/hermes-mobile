#!/usr/bin/env node

/**
 * Safe-defaults validation for Hermes Mobile.
 *
 * Authoritatively loads the sidecar config module with environment
 * variables cleared and asserts that runtime defaults are safe.
 * Fails if the config module cannot be loaded or returns unsafe values.
 * No npm ci — deps are expected to be installed by the CI job step.
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SIDECAR_SRC = resolve(ROOT, 'services/hermes-sidecar/src/lib/config.ts');

// ── 1. Save and clear the four env vars ──────────────────────────────

const cleared = {
  HERMES_INTEGRATION_MODE: process.env['HERMES_INTEGRATION_MODE'],
  MOBILE_WRITE_ACTIONS_ENABLED: process.env['MOBILE_WRITE_ACTIONS_ENABLED'],
  PUSH_DELIVERY_ENABLED: process.env['PUSH_DELIVERY_ENABLED'],
  DATABASE_MODE: process.env['DATABASE_MODE'],
};

for (const k of Object.keys(cleared)) delete process.env[k];

// ── 2. Load the actual config module (authoritative) ─────────────────

console.log('\n═══ Safe-defaults validation ═══\n');

let exitCode = 0;

console.log('--- Loading sidecar config module ---');

let loadConfig;
try {
  const mod = await import(SIDECAR_SRC);
  loadConfig = mod.loadConfig;
  console.log('  ✓ config module loaded successfully');
} catch (err) {
  console.log(`  ✗ FAILED to load config module: ${err.message}`);
  console.log('    (Check that sidecar dependencies are installed and config.ts compiles.)');
  process.exit(1);
}

// ── 3. Assert runtime defaults from the authoritative source ─────────

console.log('\n--- Checking default values from config module ---');

const cfg = loadConfig();

const assertions = [
  ['cfg.hermesIntegrationMode === "mock"', cfg.hermesIntegrationMode === 'mock'],
  ['cfg.mobileWriteActionsEnabled === false', cfg.mobileWriteActionsEnabled === false],
  ['cfg.pushDeliveryEnabled === false', cfg.pushDeliveryEnabled === false],
  ['cfg.databaseMode === "test"', cfg.databaseMode === 'test'],
];

for (const [label, ok] of assertions) {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ✗ ${label}`);
    exitCode = 1;
  }
}

// ── 4. Positive test: unsafe override must be detected ───────────────

console.log('\n--- Positive: unsafe override must be detected ---');

// Temporarily set an unsafe value and verify loadConfig reflects it
process.env['MOBILE_WRITE_ACTIONS_ENABLED'] = 'true';
const unsafeCfg = loadConfig();
if (unsafeCfg.mobileWriteActionsEnabled === true) {
  console.log('  ✓ Unsafe MOBILE_WRITE_ACTIONS_ENABLED=true reflected by loadConfig');
} else {
  console.log('  ✗ Unsafe value NOT detected — override silently ignored!');
  exitCode = 1;
}
delete process.env['MOBILE_WRITE_ACTIONS_ENABLED'];

// ── Summary ─────────────────────────────────────────────────────────

console.log('');
if (exitCode === 0) {
  console.log('All safe-defaults checks passed.');
} else {
  console.log(`FAILED: ${exitCode} check(s) failed — default values would be unsafe.`);
}
process.exit(exitCode);
