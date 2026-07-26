# Hermes Mobile

Mobile command center for the Hermes Agent — an Expo React Native Android application with a hardened Node.js sidecar gateway.

## Repository structure

```
hermes-mobile/
├── app/                     # Expo Router pages (auth, today, tasks, etc.)
├── components/              # Shared React Native components (shadcn/RN Reusables)
├── lib/                     # Core libraries (utils, theme)
├── assets/                  # Static assets
├── services/
│   └── hermes-sidecar/      # Hardened Fastify/TypeScript sidecar gateway
├── docs/                    # Architecture and development documentation
├── package.json             # Root workspace — Expo commands + sidecar scripts
└── app.json                 # Expo configuration
```

## Quick start

### Mobile app (Expo)
```bash
npm run dev           # Start Expo dev server
npm run android       # Start for Android emulator
```

### Sidecar (Node.js gateway)
```bash
npm run sidecar:install    # Install sidecar dependencies
npm run sidecar:dev        # Start in mock mode on 127.0.0.1:18790
npm run sidecar:test       # Run all 96 sidecar tests
npm run sidecar:typecheck  # TypeScript check
```

### Sidecar mock mode
The sidecar starts in safe mock mode by default — no production Hermes connection needed. It uses a built-in mock Hermes Gateway server on port 18642.

## Safety defaults

```env
HERMES_INTEGRATION_MODE=mock     # No production Hermes connection
MOBILE_WRITE_ACTIONS_ENABLED=false  # Write routes disabled
PUSH_DELIVERY_ENABLED=false      # No push notifications
DATABASE_MODE=test               # In-memory state only
```

## Services

### Hermes Sidecar (`services/hermes-sidecar/`)
Standalone Node.js/TypeScript/Fastify gateway that sits between the Hermes Agent and mobile devices. Provides:
- 13 read-only Hermes API endpoints
- HMAC-SHA256 JWT auth (10-min access tokens, 30-day refresh)
- 5-layer rate limiting (IP, principal, device, endpoint, token refresh)
- WebSocket event relay with heartbeat, reconnect, dedup
- 13-table Postgres schema (migration files only — not applied)
- 96 passing tests across 6 test suites

See `services/hermes-sidecar/README.md` for full details.

## Development

- **Mobile**: Edit `app/`, `components/`, `lib/` for React Native screens
- **Sidecar**: Edit `services/hermes-sidecar/src/` for gateway code
- **Tests**: `npm run sidecar:test` (96 tests), mobile tests TBD
- **OpenAPI**: `npm run sidecar:openapi` to regenerate

## Restrictions

- Sidecar binds only to `127.0.0.1` in dev mode
- Write actions are disabled by default
- Push delivery is disabled by default
- No production Hermes API keys in this repository
- No Cloudflare, nginx, or systemd config committed
- No database migrations applied automatically
