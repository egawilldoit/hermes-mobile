# Mobile-Sidecar Contract

## Base URL

Development: `http://127.0.0.1:18790`
Production: `http://127.0.0.1:8790` (via Cloudflare Tunnel)

## Authentication

### Register device
```
POST /v1/mobile/devices/register
Content-Type: application/json

{
  "enrollment_code": "string",
  "device_name": "string",
  "platform": "android" | "ios",
  "push_token": "string?"        // optional
}

→ 200
{
  "device_id": "string",
  "access_token": "string",      // 10-minute JWT
  "refresh_token": "string",     // 30-day rotating token
  "expires_in": 600,
  "token_type": "Bearer"
}
```

### Refresh token
```
POST /v1/mobile/token/refresh
Content-Type: application/json

{
  "refresh_token": "string"
}

→ 200
{
  "access_token": "string",
  "refresh_token": "string",     // rotated — previous becomes invalid
  "expires_in": 600,
  "token_type": "Bearer"
}

→ 401: Invalid or expired refresh token
→ 403: Suspected token theft — device revoked
```

### Authenticate requests
```
Authorization: Bearer <access_token>
```

## Read endpoints

### Health
```
GET /health
→ 200 { "status": "ok", "version": "0.1.0", "uptime": 123, "mode": "mock" }
```

### Readiness
```
GET /ready
→ 200 { "status": "ready", "checks": { ... } }
```

### Hermes gateway info (all require Bearer token)
```
GET /v1/hermes/status              → { "status": "ok", ... }
GET /v1/hermes/capabilities        → { "capabilities": [...] }
GET /v1/hermes/models              → { "models": [...] }
GET /v1/hermes/skills              → { "skills": [...] }
GET /v1/hermes/toolsets            → { "toolsets": [...] }
```

### Sessions (require Bearer token)
```
GET /v1/sessions                          → [ ... ]
GET /v1/sessions/:sessionId               → { ... }
GET /v1/sessions/:sessionId/messages      → [ ... ]
```

### Jobs (require Bearer token)
```
GET /v1/jobs                              → [ ... ]
GET /v1/jobs/:jobId                       → { ... }
```

### Device management (require Bearer token)
```
DELETE /v1/mobile/devices/:deviceId
→ 200 { "success": true, "device_id": "string", "revoked_at": "ISO8601" }
→ 403 { "error": "Device has been revoked", "code": "DEVICE_REVOKED" }
```

### Alerts (require Bearer token)
```
GET /v1/mobile/alerts
→ 200 { "alerts": [...], "device_id": "string" }
```

## WebSocket event stream

### Connect
```
GET /v1/mobile/events?lastEventId=<optional>
Upgrade: websocket
Authorization: Bearer <access_token>
```

### Event format
```json
{
  "id": "evt_5_a1b2c3d4",       // monotonic event ID
  "sequence": 5,                 // incremental sequence number
  "type": "run_update",          // event type
  "data": { "run_id": "run_1", "status": "running" },
  "timestamp": "2026-07-26T12:00:00Z"
}
```

### Heartbeat (every 30s)
```json
{ "type": "heartbeat", "timestamp": "2026-07-26T12:00:30Z" }
```

### Reconnection
- Send `lastEventId` query param on reconnect
- Sidecar replays up to 100 missed events
- Client should track the highest received `sequence`

### Backpressure
- Server queues up to 100 events per client
- Oldest events dropped on overflow
- Clients disconnected after 30s of inactivity

## Rate limits

| Scope | Limit | Window |
|-------|-------|--------|
| IP | 60 requests | 1 minute |
| Principal | 120 requests | 1 minute |
| Device | 60 requests | 1 minute |
| Token refresh | 5 requests | 1 minute |
| Device registration | 3 requests | 1 hour |
| Alert polling | 30 requests | 1 minute |
| WebSocket connections | 3 per device | concurrent |

Rate-limited responses return `429` with `Retry-After` header.

## Error format

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

| Code | Status | Meaning |
|------|--------|---------|
| `AUTH_REQUIRED` | 401 | No Bearer token |
| `INVALID_TOKEN` | 401 | Token expired or invalid |
| `DEVICE_REVOKED` | 403 | Device has been revoked |
| `FORBIDDEN` | 403 | Insufficient scope |
| `RATE_LIMITED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Route not in permission matrix |
| `UPSTREAM_ERROR` | 500 | Hermes Gateway error (redacted) |
