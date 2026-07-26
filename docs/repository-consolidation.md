# Repository Consolidation

## Why Hermes Mobile is separate from EGA House Platform

- **Different lifecycles** — Mobile app and sidecar release independently from the EGA House backend
- **Different dependency trees** — Expo/React Native (pnpm) vs Fastify/Node.js (npm)
- **Different risks** — Mobile auth, push notifications, and device management unrelated to EGA automations
- **Existing separation** — The Expo app was already its own GitHub repo (`github.com:egawilldoit/hermes-mobile.git`)

## Consolidation history

| Date | Action |
|------|--------|
| 2026-07-26 | Created `feature/hermes-sidecar-integration` branch |
| 2026-07-26 | Copied sidecar from `ega-house/apps/hermes-sidecar/` → `services/hermes-sidecar/` |
| 2026-07-26 | Created `packages/contracts/` with shared TypeScript types |
| 2026-07-26 | Created `lib/api-client.ts` — mock-mode Hermes API client |
| 2026-07-26 | 96/96 sidecar tests pass, TypeScript clean |
| 2026-07-26 | 2 local commits, NOT pushed |

## Repository layout

```
hermes-mobile/
├── app/                    # Expo Router (untouched template)
├── components/             # shadcn/RN Reusables UI
├── lib/
│   ├── utils.ts            # cn helper
│   ├── theme.ts            # light/dark theme
│   └── api-client.ts       # Hermes Mobile API client (mock mode)
├── services/
│   └── hermes-sidecar/     # Fastify gateway (96 tests)
├── packages/
│   └── contracts/          # Shared TypeScript types
├── docs/                   # Architecture, dev, contract, deployment
├── package.json            # Expo + sidecar scripts
└── README.md
```

## What is NOT yet done

- Android APK build — not started
- Push notifications — disabled by default
- Cloudflare setup — deferred, runbook in earlier remediation
- Production authentication — mock-only
- Write actions — disabled by default
- EGA House sidecar deletion — pending approval

## EGA House status

The original sidecar source remains at `/home/ubuntu/ega-house/apps/hermes-sidecar/` (untracked).
**Do not delete until the new location is reviewed and committed.**
