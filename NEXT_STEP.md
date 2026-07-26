# Next Step After Repository Consolidation

## 1. Approve push to GitHub

```bash
cd /home/ubuntu/hermes-mobile && git push origin feature/hermes-sidecar-integration
```

## 2. Build an Expo API consumer

Create screens that use `lib/api-client.ts` to display sidecar data:
- Health indicator on the home screen
- Session list screen
- Model/skills browser

## 3. Add navigation screens

Build the mobile app structure:
- Auth/enrollment screen
- Dashboard/home screen
- Session viewer
- Job list

## 4. (After push) Delete EGA House sidecar copy

```bash
rm -rf /home/ubuntu/ega-house/apps/hermes-sidecar
```

Only after user explicitly approves.

## 5. (Deferred) Production deployment

See `docs/production-deployment-plan.md` — requires:
- SQLite WAL-reset fix
- Credential rotation
- Cloudflare Access setup
- Systemd unit installation
