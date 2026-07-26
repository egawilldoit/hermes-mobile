# Local Development

## Prerequisites

- Node.js 24.x (sidecar) / Node.js 22.x (Expo)
- npm 11+ (sidecar) / pnpm (Expo — uses hoisted node_modules)
- Android emulator or device (for mobile app)

## Setup

```bash
# Clone (already done)
cd /home/ubuntu/hermes-mobile

# Install mobile dependencies
pnpm install    # or: npm install (uses hoisted mode)

# Install sidecar dependencies
npm run sidecar:install
cd services/hermes-sidecar && cp .env.example .env && cd ../..
```

## Running the sidecar (mock mode)

```bash
npm run sidecar:dev
```

This starts:
- Mock Hermes Gateway on `http://127.0.0.1:18642`
- Sidecar on `http://127.0.0.1:18790`

Health check: `curl http://127.0.0.1:18790/health`

## Running the mobile app

```bash
npm run android
# or
npm run dev
```

## Running tests

```bash
# All sidecar tests
npm run sidecar:test

# Specific test file
cd services/hermes-sidecar && npx vitest run test/auth.test.ts
```

## Type checking

```bash
npm run sidecar:typecheck
```

## OpenAPI spec

```bash
npm run sidecar:openapi
# Generates services/hermes-sidecar/openapi.json
```

## Environment

Copy `.env.example` to `.env` in `services/hermes-sidecar/` and adjust:

```
PORT=18790                    # Dev port
HERMES_INTEGRATION_MODE=mock  # Use mock Hermes (no production connection)
HERMES_API_KEY=change_me      # Set to your mock/test key
```

## Common tasks

| Task | Command |
|------|---------|
| Start sidecar | `npm run sidecar:dev` |
| Run sidecar tests | `npm run sidecar:test` |
| TypeScript check | `npm run sidecar:typecheck` |
| Start Expo dev | `npm run dev` |
| Clean install | `npm run clean && npm run sidecar:install` |

## Known issues

- Android emulator uses `10.0.2.2` to reach host localhost; the sidecar on 127.0.0.1 is not reachable from physical devices without a tunnel
- TypeScript 6.x in the Expo project has a deprecation warning for `baseUrl` in tsconfig
