# Hermes Mobile

Hermes Mobile is the Android governed control plane for the Hermes Agent installation running on the `openclaw` VM. The repository contains the Expo/React Native application, the hardened Fastify sidecar, portable mobile-sidecar contracts, and the product planning documents.

## Product authority

- [Canonical Wayfinder issue](https://github.com/egawilldoit/hermes-mobile/issues/2)
- [Hermes Mobile Wayfinder Map](docs/HERMES_MOBILE_WAYFINDER.md)
- [Hermes Mobile MVP Specification](docs/HERMES_MOBILE_MVP_SPEC.md)
- [Tracker-published MVP specification](https://github.com/egawilldoit/hermes-mobile/issues/13)
- [Hermes Mobile Linear project](https://linear.app/egawilldoit/project/hermes-mobile-c7f609dbec6e)

## Repository structure

```text
hermes-mobile/
├── app/                         # Expo Router application
├── components/                  # React Native Reusables components
├── lib/                         # Theme, utilities, and typed API client
├── packages/contracts/          # Portable mobile-sidecar contracts
├── services/hermes-sidecar/     # Fastify/TypeScript sidecar
├── docs/                        # Architecture, Wayfinder, spec, and runbooks
├── AGENTS.md                    # Repository-wide agent rules
└── app.json                     # Expo configuration
```

Scoped agent instructions also exist under `app/`, `packages/contracts/`, and `services/hermes-sidecar/`.

## Package-manager boundaries

- Root/mobile application: **pnpm** with `pnpm-lock.yaml`.
- Sidecar: **npm** with `services/hermes-sidecar/package-lock.json`.

Do not introduce another lockfile or convert either boundary without an authorized issue.

## Quick start

### Mobile app

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm android
```

### Sidecar

```bash
npm ci --prefix services/hermes-sidecar
npm --prefix services/hermes-sidecar run dev
npm --prefix services/hermes-sidecar run typecheck
npm --prefix services/hermes-sidecar test
npm --prefix services/hermes-sidecar run openapi
```

### Shared contracts

```bash
pnpm exec tsc -p packages/contracts/tsconfig.json --noEmit
```

The root package currently has no dedicated mobile lint or mobile test script. Do not claim those checks passed until the repository adds them.

## Safe development defaults

```env
HERMES_INTEGRATION_MODE=mock
MOBILE_WRITE_ACTIONS_ENABLED=false
PUSH_DELIVERY_ENABLED=false
DATABASE_MODE=test
```

These defaults mean local development does not connect to production Hermes, expose mobile write actions, deliver push notifications, or apply production database migrations.

## Sidecar boundary

The sidecar is a narrow authentication, authorization, compatibility, event-relay, notification, reconciliation, and audit boundary. It provides explicit allowlisted operations and must never become:

- a generic proxy;
- an arbitrary URL or header forwarder;
- a shell or command runner;
- a sudo/root or infrastructure-secret interface;
- a direct Hermes SQLite client;
- a second Hermes session, run, job, approval, scheduler, memory, or execution engine.

See [services/hermes-sidecar/README.md](services/hermes-sidecar/README.md) and [docs/mobile-sidecar-contract.md](docs/mobile-sidecar-contract.md).

## Current release direction

Delivery is intentionally staged:

1. Safe repository and contract foundation.
2. Android read-only vertical slice.
3. Remote read-only pilot through Cloudflare and the sidecar.
4. Governed chat and run controls.
5. Evidence-bound approvals, governed jobs, and signed Samsung pilot validation.

Production capabilities remain disabled until the matching evidence and release gates in the MVP specification pass.

## Development restrictions

Code-only work must not:

- modify sudoers, users/groups, Docker, systemd, nginx, Cloudflare, SSH, firewall, PM2, timers, Python/SQLite, Hermes configuration, production databases, or production secrets;
- restart production services;
- deploy automatically;
- commit secrets, local databases, logs, caches, generated credentials, or build output.

Production operations require explicit human authorization, backup, validation, and rollback evidence.

## Primary references

- [Hermes API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [SQLite WAL-reset issue](https://sqlite.org/wal.html#the_wal_reset_bug)
