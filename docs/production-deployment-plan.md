# Production Deployment Plan

> **⚠️ DOCUMENTATION ONLY — NOT EXECUTED**
> This plan describes the steps to deploy the sidecar to production.
> Do not execute without explicit approval and operator access.

## Prerequisites

- [ ] Hermes Gateway running on production VM (`openclaw`, port 8642)
- [ ] Sidecar code committed and pushed to GitHub
- [ ] Cloudflare Access apps created (see `MANUAL_CLOUDFLARE_SETUP.md` from earlier remediation)
- [ ] 19 exposed credentials rotated (see earlier remediation report)
- [ ] SQLite WAL-reset bug resolved (`hermes doctor` passes)

## Deployment steps

### 1. Build sidecar
```bash
cd services/hermes-sidecar
npm install
npm run typecheck
npm test
```

### 2. Configure environment
```env
PORT=8790
HERMES_INTEGRATION_MODE=live
HERMES_GATEWAY_URL=http://127.0.0.1:8642
HERMES_API_KEY=<production-key>
DATABASE_MODE=production
DATABASE_URL=<supabase-connection-string>
```

### 3. Create systemd unit
```
[Unit]
Description=EGA Hermes Mobile Sidecar
After=network.target hermes-gateway.service

[Service]
User=hermes-sidecar
Group=hermes-sidecar
ExecStart=/usr/bin/node /opt/hermes-sidecar/dist/main.js
WorkingDirectory=/opt/hermes-sidecar
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=strict
ProtectHome=yes
CapabilityBoundingSet=
RestrictAddressFamilies=AF_INET AF_UNIX
MemoryDenyWriteExecute=true

[Install]
WantedBy=multi-user.target
```

### 4. Copy to production
```bash
rsync -av --exclude=node_modules --exclude=test ./services/hermes-sidecar/ /opt/hermes-sidecar/
cd /opt/hermes-sidecar && npm install --production
```

### 5. Activate Cloudflare ingress
Add tunnel routes for `mobile-auth` and `mobile-api` to cloudflared config (see `MANUAL_CLOUDFLARE_SETUP.md`).

### 6. Start
```bash
sudo systemctl enable --now ega-hermes-sidecar.service
```

### 7. Verify
```bash
curl http://127.0.0.1:8790/health
curl http://127.0.0.1:8790/v1/hermes/status  # requires auth
```

## Rollback
```bash
sudo systemctl stop ega-hermes-sidecar.service
sudo rm /etc/systemd/system/ega-hermes-sidecar.service
sudo systemctl daemon-reload
# Remove cloudflared ingress entries
# Restore previous sidecar version from backup
```

## Deferred items
- **Write actions**: Enable only after approval proof, idempotency, and stale-state detection are tested
- **Push notifications**: Set `PUSH_DELIVERY_ENABLED=true` after Expo credentials configured
- **Database migrations**: Apply `db/migrations/001_initial_schema.sql` to Supabase
- **Monitoring**: Add health check endpoints to uptime monitoring
- **Production rate limits**: Tune nginx rate limits after observing traffic patterns

## Security notes
- Sidecar user must have `sudo: none`, `docker: none`, no SSH keys, no Hermes SQLite access
- Never expose sidecar port outside 127.0.0.1 — all external traffic goes through Cloudflare Tunnel
- Refresh tokens are never stored raw — SHA-256 hashed server-side
- All secrets redacted in structured logs via Pino
