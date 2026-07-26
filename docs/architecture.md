# Architecture

## Overview

Hermes Mobile has two components:

1. **Mobile app** — Expo/React Native app (Android-first) that provides the mobile interface to the Hermes Agent
2. **Sidecar gateway** — Node.js/Fastify service that mediates between mobile devices and the Hermes Agent, adding auth, rate limiting, and security controls

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Android App │────▶│  Hermes Sidecar  │────▶│ Hermes Gateway │
│  (Expo/RN)   │◀────│  (:18790 dev)    │◀────│  (:8642 prod)  │
└──────────────┘     └──────────────────┘     └────────────────┘
                            │                          │
                            ├─ JWT auth                ├─ Direct HTTP
                            ├─ Rate limiting            ├─ SSE streaming
                            ├─ WS event relay           └─ REST API
                            └─ No production secrets
```

## Principles

- **Sidecar is not a generic proxy** — exposes only explicitly designed mobile endpoints
- **No Hermes SQLite access** — sidebar queries the gateway via HTTP only
- **No production secrets on mobile** — API key stays server-side
- **Mock-first development** — all tests use a mock Hermes Gateway
- **Write actions disabled by default** — gated behind `MOBILE_WRITE_ACTIONS_ENABLED`

## Auth flow

```
Device Registration:
  POST /v1/mobile/devices/register
  → enrollment_code + device_name + platform
  → access_token (10min JWT) + refresh_token (30d)

Request Auth:
  Authorization: Bearer <access_token>
  → Validated by onRequest hook → scope check → rate limit

Token Refresh:
  POST /v1/mobile/token/refresh
  → refresh_token (body) → rotation + theft detection
  → new token pair (old refresh invalidated)

Device Revocation:
  DELETE /v1/mobile/devices/:deviceId
  → Revokes all tokens for device
```

## Sidecar structure

```
services/hermes-sidecar/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.ts                  # Fastify app assembly
│   ├── routes/                 # Route handlers
│   ├── lib/                    # Core libraries (auth, rate-limiter, event-relay, etc.)
│   ├── types/                  # TypeScript type definitions
│   └── middleware/             # Fastify hooks (auth, permissions)
├── db/migrations/              # 13-table Postgres schema (not applied)
├── test/                       # 96 tests across 6 files
├── scripts/                    # OpenAPI spec generator
├── .env.example                # Environment template
└── vitest.config.ts
```

## Data flow

```
Mobile App → [Cloudflare Tunnel] → Sidecar :8790
  → Auth middleware (JWT validation)
  → Route permission check (explicit allowlist)
  → Rate limit check (IP/principal/device/endpoint)
  → Route handler
  → HermesClient (internal) → Hermes Gateway :8642
  → Response → Mobile App
```

For WebSocket events:
```
Sidecar → Hermes SSE stream → EventBus → Normalized events
  → WebSocket client queue → Mobile App
  → Heartbeat every 30s
  → Reconnect via lastEventId (up to 100 event replay)
  → Backpressure (max 100 queued, drops oldest)
```
