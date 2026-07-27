// ── OpenAPI / Route Drift Check ──
// Proves:
//  - /v1/health and /v1/ready exist as registered routes
//  - Every client method path maps to a registered server route
//  - No unversioned /health or /ready alias remains on public routes
//  - All client paths are versioned (v1/)
//  - OpenAPI generation script produces valid output

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestContext, destroyTestContext, type TestContext } from './helpers.js';

let ctx: TestContext;

beforeAll(async () => {
  ctx = await createTestContext();
});

afterAll(async () => {
  await destroyTestContext(ctx);
});

describe('OpenAPI / Route Drift Check', () => {
  // ── Collect all registered routes ──
  // Fastify's printRoutes() returns a hierarchical tree:
  //
  //   ├── /v1/health (GET, HEAD)
  //   ├── /v1/sessions (GET, HEAD)
  //   │   └── /:sessionId (GET, HEAD)
  //   │       └── /messages (GET, HEAD)
  //
  // We flatten it to route objects with full paths.

  function collectRoutes(): { method: string; path: string }[] {
    const tree = ctx.app.printRoutes({ commonPrefix: false });
    const lines = tree.split('\n');
    const routes: { method: string; path: string }[] = [];

    // Stack of parent paths by depth level
    const parentStack: string[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Determine depth by counting leading prefix characters
      // Each level contributes 4 characters (│ + 3 spaces, or ├── / └── )
      const prefix = line.match(/^[│├└─\s]+/)?.[0] || '';
      const depth = Math.max(0, Math.floor((prefix.length - 4) / 4));

      // Strip the box-drawing prefix and extract content
      const content = line.replace(/^[│├└─\s]+/, '').trim();

      // Extract HTTP methods in parentheses at the end: "(GET, HEAD)"
      const methodMatch = content.match(/\(([^)]+)\)$/);
      if (!methodMatch) continue;
      const methodsStr = methodMatch[1];

      // Extract path — everything before the parenthesized methods
      const pathSegment = content.slice(0, content.lastIndexOf('(')).trim();

      // Reconstruct full path
      parentStack[depth] = pathSegment;
      parentStack.length = depth + 1;
      const fullPath = parentStack.slice(0, depth + 1).join('');

      // Split "GET, HEAD" into individual methods
      const methods = methodsStr.split(',').map((m: string) => m.trim());

      for (const method of methods) {
        routes.push({ method, path: fullPath });
      }
    }

    return routes;
  }

  it('has /v1/health and /v1/ready registered', () => {
    const routes = collectRoutes();
    const healthRoute = routes.find(r => r.path === '/v1/health');
    const readyRoute = routes.find(r => r.path === '/v1/ready');

    expect(healthRoute, 'Expected /v1/health route to exist').toBeDefined();
    expect(healthRoute!.method).toBe('GET');
    expect(readyRoute, 'Expected /v1/ready route to exist').toBeDefined();
    expect(readyRoute!.method).toBe('GET');
  });

  it('has no unversioned /health or /ready public route', () => {
    const routes = collectRoutes();
    const unversionedHealth = routes.find(r => r.path === '/health');
    const unversionedReady = routes.find(r => r.path === '/ready');
    expect(unversionedHealth, 'Found unversioned /health route').toBeUndefined();
    expect(unversionedReady, 'Found unversioned /ready route').toBeUndefined();
  });

  it('every client method path maps to a registered route', () => {
    const routes = collectRoutes();

    // All paths used by the mobile client (api-client.ts)
    const clientPaths: { method: string; path: string }[] = [
      { method: 'GET', path: '/v1/health' },
      { method: 'GET', path: '/v1/ready' },
      { method: 'POST', path: '/v1/mobile/devices/register' },
      { method: 'POST', path: '/v1/mobile/token/refresh' },
      { method: 'DELETE', path: '/v1/mobile/devices/:deviceId' },
      { method: 'GET', path: '/v1/hermes/capabilities' },
      { method: 'GET', path: '/v1/hermes/models' },
      { method: 'GET', path: '/v1/hermes/skills' },
      { method: 'GET', path: '/v1/hermes/toolsets' },
      { method: 'GET', path: '/v1/sessions' },
      { method: 'GET', path: '/v1/sessions/:sessionId' },
      { method: 'GET', path: '/v1/sessions/:sessionId/messages' },
      { method: 'GET', path: '/v1/hermes/status' },
      { method: 'GET', path: '/v1/jobs' },
      { method: 'GET', path: '/v1/jobs/:jobId' },
      { method: 'GET', path: '/v1/mobile/alerts' },
    ];

    for (const cp of clientPaths) {
      const matched = routes.some(
        r => r.method === cp.method && r.path === cp.path
      );
      expect(
        matched,
        `Client path ${cp.method} ${cp.path} not found in registered server routes. ` +
        `Available routes: ${routes.map(r => `${r.method} ${r.path}`).join(', ')}`
      ).toBe(true);
    }
  });

  it('all registered routes are versioned (v1/ prefix)', () => {
    const routes = collectRoutes();

    for (const r of routes) {
      // Skip internal Fastify routes (swagger UI, etc.)
      if (r.path.startsWith('/docs') || r.path.startsWith('/swagger') || r.path.startsWith('/.well-known')) {
        continue;
      }
      expect(r.path, `Route ${r.method} ${r.path} is not versioned`).toMatch(/^\/v1\//);
    }
  });

  it('generated OpenAPI script produces valid spec', () => {
    // The openapi.json is generated by scripts/generate-openapi.ts.
    // Routes don't have @fastify/swagger schema annotations yet, so paths are empty.
    // This test verifies the script ran successfully and produced valid JSON with
    // the expected top-level structure. Full route-level OpenAPI annotations are
    // tracked separately.
    const fs = require('node:fs');
    const path = require('node:path');
    const spec = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '..', 'openapi.json'), 'utf-8')
    );

    expect(spec).toHaveProperty('openapi', '3.0.3');
    expect(spec).toHaveProperty('info.title', 'Hermes Mobile Sidecar API');
    expect(spec).toHaveProperty('info.version', '0.2.0');
    expect(spec).toHaveProperty('paths');
    expect(spec).toHaveProperty('servers');
    expect(spec.servers).toHaveLength(1);
    expect(spec.servers[0].url).toBe('http://127.0.0.1:18790');
  });
});
