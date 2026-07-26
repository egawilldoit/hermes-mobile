# Hermes Mobile Wayfinder Map

**Status:** Direction established; implementation and production-evidence frontier remains open  
**Version:** 1.1  
**Last reviewed:** 2026-07-26  
**Repository:** [`egawilldoit/hermes-mobile`](https://github.com/egawilldoit/hermes-mobile)  
**Canonical tracker map:** [Wayfinder Map — Hermes Mobile Governed Operator MVP](https://github.com/egawilldoit/hermes-mobile/issues/2)  
**Companion specification:** [Hermes Mobile MVP Specification](./HERMES_MOBILE_MVP_SPEC.md)

## Destination

Deliver a secure Android private-pilot application for one operator and one production Hermes Agent installation on the `openclaw` VM.

The finished MVP provides:

- a native operational Command Center;
- secure session browsing and governed chat/run control;
- scheduled-job visibility and explicitly permitted controls;
- urgent, redacted notifications;
- full-screen evidence-bound approvals;
- reliable reconnect and state reconciliation;
- device enrollment, revocation, and risk-based biometric step-up;
- no Hermes master key, provider key, infrastructure secret, generic proxy, or arbitrary shell on the phone.

The destination is reached only after the signed Android build passes the real Samsung lifecycle matrix and every enabled production mutation passes its security, compatibility, idempotency, audit, and rollback gates.

---

## How Wayfinder is represented

Matt Pocock's Wayfinder method treats the issue-tracker map as canonical and uses tickets to resolve decisions or evidence gates. This project therefore has two complementary artifacts:

1. [GitHub issue #2](https://github.com/egawilldoit/hermes-mobile/issues/2) is the live canonical Wayfinder map and frontier index.
2. This Markdown file is the durable high-resolution architecture and decision record stored with the code.

The available GitHub connector did not expose native sub-issue/dependency or label creation. Frontier issues link back to the map in their bodies. Native relationships and `wayfinder:*` labels can be added later without changing the substance of the map.

Reference: [Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md).

---

## Evidence classes and confidence

This map does not mix facts, decisions, and targets.

### Repository-verified

Visible in the GitHub repository or PR.

### Operator-reported local implementation

Reported from `/home/ubuntu/hermes-mobile` on the VM but not yet visible on GitHub. These claims remain provisional until the branch is pushed and tests are reproduced.

### VM-audit evidence

Reported by the four-agent read-only audit and remediation reports produced on `openclaw` on 2026-07-26.

### Selected product policy

Decisions explicitly selected in the planning conversation. They are requirements, not claims that production already implements them.

### External primary-source guidance

Behavior taken from official Hermes, Expo, React Native, Cloudflare, Supabase, Fastify, SQLite, Android, Docker, or systemd documentation.

---

## Current reality

### GitHub-visible baseline

At the time of this review, GitHub `main` contains the original React Native Reusables template:

- Expo `~56.0.13`;
- React Native `0.85.3`;
- React `19.2.3`;
- Expo Router `~56.2.12`;
- NativeWind and React Native Reusables;
- portrait orientation;
- typed Expo Router routes;
- no Android package identifier yet;
- no production authentication, push, Cloudflare, sidecar, or Hermes integration visible on `main`.

Sources:

- [package.json](../package.json)
- [app.json](../app.json)
- [root layout](../app/_layout.tsx)

### Operator-reported consolidated local branch

The operator reported that local branch `feature/hermes-sidecar-integration` contains:

- `1e4e37a` — repository structure;
- `a6b478d` — hardened Hermes Mobile sidecar;
- `806669d` — shared contracts, mock API client, and documentation;
- 27 sidecar files;
- 96/96 sidecar tests passing;
- mock mode enabled by default;
- write actions disabled;
- no deployment or VM mutation.

Reported structure:

```text
hermes-mobile/
├── app/                         # preserved Expo Router application
├── components/                  # preserved React Native Reusables UI
├── lib/api-client.ts            # typed mobile API client
├── services/hermes-sidecar/     # Fastify sidecar
├── packages/contracts/          # portable shared contracts
├── docs/
└── reports
```

Reported hardened-sidecar contract includes:

- device registration returning short-lived access and rotating refresh credentials;
- token refresh with reuse/theft detection;
- device revocation;
- an authenticated mobile WebSocket event stream with `lastEventId` replay;
- replay bounded to 100 events;
- a reported default general limit of 60 requests/minute;
- a reported refresh limit of 5 requests/minute;
- a reported maximum of 3 concurrent WebSocket connections per device.

The exact route names reported were `POST /register`, `POST /token/refresh`, `DELETE /devices/:id`, and `GET /v1/mobile/events?lastEventId=`. They are **implementation evidence, not yet the final public contract**. Issue [Publish and verify the consolidated Hermes Mobile foundation](https://github.com/egawilldoit/hermes-mobile/issues/3) must push the branch, reproduce the tests, inspect OpenAPI/runtime schemas, and reconcile route naming before remote deployment.

### Installed Hermes runtime

The VM audit reported:

- Hermes version `0.19.0`;
- exact commit `92549c9a6e6e7c03a9cb945a2c4e75179a0e2d7d`;
- API server bound to `127.0.0.1:8642`;
- `/health`, `/health/detailed`, `/v1/capabilities`, models, skills, toolsets, sessions, jobs, runs, run SSE, stop, and approval endpoints;
- no WebSocket route on the API server;
- separate TUI-gateway JSON-RPC/WebSocket behavior associated with `hermes serve`/rich-client integration.

The mobile architecture must validate the exact running `/v1/capabilities`; current upstream documentation cannot replace exact-commit runtime evidence.

Primary Hermes sources:

- [API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Programmatic Integration](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md)
- [API implementation](https://github.com/NousResearch/hermes-agent/blob/main/gateway/platforms/api_server.py)
- [Desktop architecture](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/README.md)

### VM remediation posture

Operator-reported remediation completed:

- unrestricted `NOPASSWD: ALL` removed;
- `ubuntu` removed from the Docker group;
- staged Hermes Gateway systemd hardening applied;
- unsafe secret-file permissions corrected;
- PM2 dump sanitized;
- credential-bearing shell history cleaned;
- disk use reduced from roughly 82% to 64%;
- nginx rate-limit zones and SSE controls added;
- unprivileged `hermes-sidecar` account created;
- automatic Hermes update timer disabled.

These changes do **not** prove remote readiness by themselves. Remaining evidence includes:

- interactive administrator sudo and independent OCI/SSH recovery;
- a fresh login proving old Docker supplementary-group access is gone;
- rotation and revocation of the 19 reported exposed credentials;
- durable WebUI/PM2 secret loading that does not repopulate secrets on `pm2 save` or reboot;
- trusted Cloudflare real-client-IP restoration before origin IP limits are trusted;
- confirmation that SSE uses `proxy_buffering off` or an upstream response `X-Accel-Buffering: no`, not only a request header;
- exact Cloudflare Access/Tunnel and origin-bypass validation;
- a fixed SQLite runtime before production write controls;
- gated candidate/current/previous Hermes promotion and rollback.

The systemd security score is a sandboxing indicator, not proof of application-level safety. Further risky VM changes remain frozen unless performed as a reviewed, backed-up, rollback-tested production operation.

---

## Decisions so far

### 1. Product boundary — Governed Operator

Hermes Mobile is a governed control plane, not remote root and not another Hermes runtime.

Permitted by the final MVP, subject to release gates:

- observe Hermes and allowlisted VM health;
- browse sessions and messages;
- governed chat and session fork/resume;
- start and stop normal governed runs;
- view and control explicitly allowed scheduled-job operations;
- approve one exact supported operation or deny it;
- receive urgent operational alerts.

Prohibited:

- generic `/proxy/*` or arbitrary Hermes path forwarding;
- arbitrary shell or arbitrary upstream URL;
- sudo/root approval;
- infrastructure secret management;
- direct Hermes SQLite access;
- duplicate session/run/job/scheduler/memory engines;
- autonomous infrastructure repair from mobile.

### 2. Release model

Release One supports:

- one approved operator;
- one production Hermes installation;
- one or more trusted devices only when explicitly enrolled;
- `principal_id`, `device_id`, and `hermes_instance_id` on mobile-owned state;
- no singleton mobile records that prevent later multi-user or multi-instance support.

Organization administration, invitations, and tenant isolation are later work.

### 3. Android private pilot

- First platform: Android only.
- Real pilot device: operator's modern Samsung running Android 14 or later.
- Intended product support floor: Android 10/API 29, subject to the actual Expo/native build configuration.
- Distribution: signed internal APK for the private pilot.
- Google Play AAB distribution and iOS are not Release One gates.
- Target package identifier: `online.egawilldoit.hermes`, subject to collision/signing validation.
- OTA updates remain disabled for the first privileged pilot unless update signing, runtime compatibility, rollback, and minimum-version enforcement are proven.

Expo source: [Internal distribution](https://docs.expo.dev/build/internal-distribution/).

### 4. Canonical repository

[`egawilldoit/hermes-mobile`](https://github.com/egawilldoit/hermes-mobile) owns:

- the existing Expo Android application;
- the Hermes Mobile sidecar;
- portable contracts;
- mobile-specific docs and tests.

EGA House Platform remains separate. The existing Expo app is preserved rather than replaced or moved for aesthetic monorepo consistency.

### 5. Native and reused UI boundary

Native Android screens own sensitive and operational surfaces:

- Command Center;
- alerts;
- approvals;
- health and diagnostics;
- job controls;
- device/session security.

The initial chat surface is not yet proven. The accepted direction is:

- evaluate the existing responsive Hermes WebUI as the first reuse candidate;
- keep Hermes Desktop/Electron direct reuse deferred;
- treat `apps/shared` and open mobile work as references until exact transport and credential boundaries are proven;
- select WebView/adapted reuse or native chat only after issue [Prove the initial chat-surface reuse boundary](https://github.com/egawilldoit/hermes-mobile/issues/6) measures security, latency, session behavior, keyboard, back navigation, and lifecycle behavior.

No Hermes master key or sidecar refresh token may be exposed to WebView JavaScript.

### 6. Network — Cloudflare Access and Tunnel

Selected production path:

```text
Android app
  → Cloudflare edge
  → Cloudflare Tunnel
  → 127.0.0.1:8790 Hermes Mobile sidecar
  → 127.0.0.1:8642 Hermes API
```

Rules:

- no new public VM listening port;
- enrollment hostname protected by Cloudflare Access email OTP and an allowlist containing only the approved operator email;
- normal API hostname protected by Cloudflare edge controls plus sidecar-issued device tokens;
- sidecar validates `Cf-Access-Jwt-Assertion` signature, issuer, audience, expiry, and approved identity during enrollment;
- origin bypass must fail;
- real client IP is accepted only through trusted Cloudflare ranges;
- API/auth/stream responses are not cached;
- streaming buffering and timeouts are explicitly tested.

Sources:

- [Cloudflare One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Validate Access JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Restore original visitor IPs](https://developers.cloudflare.com/support/troubleshooting/restoring-visitor-ips/restoring-original-visitor-ips/)

### 7. Identity and trusted-device session

```text
Cloudflare Access email verification
  → sidecar validates Access JWT
  → one-time authorization code bound to PKCE and state
  → verified Android App Link
  → trusted-device registration
  → 10-minute access token
  → rotating 30-day refresh-token family
```

Rules:

- email verification is not required on every app launch;
- authorization code lasts 60 seconds and is single-use;
- tokens are never placed in deep-link parameters;
- access token is memory-resident where possible;
- refresh token is stored in Expo SecureStore;
- device private key is Android Keystore-backed and protected by device authentication;
- refresh-token reuse revokes the token family and device session;
- lost-device revocation removes refresh access and push registration.

Sources:

- [Expo authentication](https://docs.expo.dev/guides/authentication/)
- [Expo SecureStore](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/)
- [Expo Linking](https://docs.expo.dev/linking/overview/)

### 8. Device integrity policy

For the sideloaded private APK:

- the supported pilot device must be non-rooted with a locked bootloader and current security updates;
- simple JavaScript root detection is advisory and is not a security boundary;
- when device compromise is detected or credibly suspected, high-risk controls and approval signing are disabled and the device can be revoked;
- biometric failure or cancellation has no insecure bypass;
- Google Play Integrity is a later enforcement option when Play distribution or a validated compatible setup exists; it is not assumed to protect the private sideloaded APK.

Android source: [Play Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts).

### 9. Sidecar boundary

The Node.js/TypeScript/Fastify sidecar owns:

- enrollment and trusted-device tokens;
- explicit operation adapters and runtime schemas;
- Hermes master-key custody;
- authorization and deny-by-default compatibility policy;
- rate limits by edge/IP, principal, device, operation, refresh, approval, run, and connection;
- Hermes SSE observation and mobile event relay;
- urgent alerts and push delivery;
- allowlisted VM health;
- idempotency, reconciliation, and audit evidence;
- mobile-control database access through least privilege.

It does not own Hermes truth and never reads Hermes SQLite.

Production runtime identity:

- dedicated `hermes-sidecar` account;
- no sudo, Docker, SSH keys, or broad home access;
- loopback bind `127.0.0.1:8790`;
- directional shared-input/output access only when a feature requires it.

Fastify source: [Fastify ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/).

### 10. Transport and maximum-latency strategy

- Hermes HTTP/SSE is the authoritative upstream MVP transport.
- API port `8642` is not treated as WebSocket-capable.
- REST fetches current state and performs bounded mutations.
- Hermes SSE carries chat/run lifecycle progress.
- Sidecar may normalize/multiplex lifecycle events into one authenticated React Native WebSocket connection.
- React Native EventSource support is not assumed as a core guarantee.
- Token deltas are forwarded promptly and not written to Postgres.
- Lifecycle milestones, alert state, and audit evidence may be persisted.

Mobile relay semantics:

- event ID;
- bounded monotonic sequence within relay scope;
- event type and entity identity;
- `hermes_instance_id`;
- timestamp;
- authoritative state version when available;
- redacted payload;
- heartbeat, bounded replay, `lastEventId`, deduplication, backpressure, slow-client disconnect, and reconciliation after gaps.

Initial reconnect policy:

- 250 ms, 500 ms, 1 s, 2 s, 5 s, 10 s, then 15 s maximum with jitter;
- heartbeat around every 20 seconds;
- stale after roughly 45 seconds without expected activity;
- values remain configurable and must be measured on the Samsung/Cloudflare path.

React Native sources:

- [WebSocket](https://reactnative.dev/docs/global-WebSocket)
- [AppState](https://reactnative.dev/docs/appstate)

### 11. Background observation

The phone is not the monitor.

- foreground stream may stay alive for a short grace period;
- Android suspension/termination is expected;
- sidecar continues run/job/health observation;
- push alerts urgent changes;
- foreground resume refreshes tokens, reconnects, replays where possible, and fetches authoritative state before enabling controls.

Initial server observation defaults:

- active run SSE: continuous;
- active run fallback status: 5 seconds;
- job reconciliation: 15 seconds;
- Hermes detailed readiness: 30 seconds;
- allowlisted VM health: 60 seconds;
- push receipt processing: provider-recommended delayed receipt window, initially around 15 minutes.

These are configurable defaults, not guaranteed Hermes timings.

### 12. Data ownership

Hermes owns:

- sessions, messages, runs, run events, jobs, native approval state;
- models, providers, skills, toolsets, memory, and execution configuration.

Mobile-control Postgres owns:

- principals and devices;
- refresh-token families and device public keys;
- Hermes-instance metadata;
- watched-run references;
- approval evidence;
- alerts, preferences, push tokens, and delivery receipts;
- idempotency records;
- append-only audit events;
- short-retention health samples.

Rules:

- non-public schema;
- dedicated least-privilege sidecar role;
- RLS defense in depth;
- no client service-role key;
- no full transcript, full raw tool output, provider secret, or copied Hermes job/session database.

Initial retention targets:

| Data | Retention target |
|---|---:|
| Active refresh token | Until expiry/revocation |
| Revoked token-family hashes | 90 days |
| Alerts | 90 days |
| Notification deliveries | 30 days |
| Approval evidence | 1 year |
| Audit events | At least 1 year |
| Health samples | 7 days |
| Terminal run watches | 7 days after completion |
| General idempotency | 24 hours |
| Approval idempotency/evidence | 7 days or audit retention as required |

Source: [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

### 13. Authority matrix

| Capability | Release One policy |
|---|---|
| Health, readiness, capabilities, models, skills, toolsets | Read allowed |
| Sessions/messages | Read allowed |
| Session create/resume/fork | Governed-control stage |
| Send chat prompt | Governed-control stage |
| Start normal run | Governed-control stage |
| Stop/cancel run | Explicit confirmation and reconciliation |
| List jobs | Read allowed |
| Run job now | Biometric step-up |
| Pause/resume job | Explicit confirmation |
| Create/edit job | Deferred unless separately accepted |
| Delete job/session | Deferred by default; biometric + typed confirmation if accepted |
| Approve exact operation once | Biometric-backed device signature |
| Deny approval | Allowed after current evidence review |
| Session-wide/permanent approval | Not exposed |
| Sudo/root approval | Prohibited |
| Secret submission | Prohibited in initial MVP |
| Arbitrary shell/VM administration | Prohibited |
| Unknown capability | Denied by default |

### 14. Approval contract

Approval is enabled only after the exact installed Hermes event schema is proven.

Required normalized evidence:

- approval, Hermes-instance, run, and session identity;
- tool and canonical arguments;
- command and working directory when applicable;
- affected resources and blast radius;
- risk classification;
- requested and expiry timestamps;
- operation digest;
- current state/version if Hermes exposes one.

Flow:

```text
redacted urgent push
  → full approval screen
  → authoritative refresh
  → exact evidence
  → biometric step-up
  → device signs server nonce + operation digest
  → sidecar verifies device, digest, expiry, state, and idempotency
  → approve-once or deny
  → reconcile Hermes outcome
  → append audit event
```

- no lock-screen approval;
- no client boolean as proof of biometrics;
- duplicate tap returns original idempotent result;
- timeout triggers reconciliation, not blind retry;
- changed state makes the request stale;
- missing evidence disables approval.

Target Hermes approval policy after controlled testing: manual mode, roughly 300-second review timeout. Current audit-reported smart/60-second policy is not the final mobile policy.

Source: [Expo LocalAuthentication](https://docs.expo.dev/versions/v56.0.0/sdk/local-authentication/).

### 15. Notifications

Urgent classes:

- approval required;
- run failed or blocked;
- Hermes unavailable/critically degraded;
- scheduled-job failure;
- authentication/security event;
- critical disk/database event.

Routine success stays in-app.

Rules:

- Expo Push Service with FCM for the first pilot;
- store Expo and native FCM tokens when available;
- token-change listener updates registration;
- reinstall/token rotation invalidates old registration;
- process receipts and disable `DeviceNotRegistered` tokens;
- alert database is authoritative; push is best-effort;
- notification payload contains opaque routing identifiers only;
- lock-screen text is generic;
- Android channels: approvals, failures, system-critical, routine activity;
- stable deduplication key uses event class + Hermes instance + entity + state version;
- repeated unresolved failure produces at most one interrupting push per 15 minutes by default while occurrence count updates in-app;
- quiet hours suppress non-critical pushes; approval/security/system-critical policy is explicit and configurable;
- provider outage preserves alerts and reconciles delivery later;
- Android force-stop limitation is documented.

Expo source: [Notifications SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/).

### 16. Command Center

Operational order:

1. pending approvals;
2. failed/blocked runs;
3. active runs;
4. Hermes and VM health;
5. recent sessions;
6. scheduled jobs;
7. quick chat entry.

The read-only vertical slice uses the same hierarchy with mutations absent or visibly gated.

### 17. Update compatibility

Production Hermes remains pinned while automatic maintenance is disabled.

Promotion model:

```text
candidate → validated → current → previous
```

Required before promotion:

- no active runs, pending approvals, or delegated work;
- current health and adequate disk;
- isolated candidate runtime/state;
- health, detailed readiness, capabilities, REST/SSE contracts;
- sidecar and WebUI compatibility;
- tested rollback.

Unsupported Hermes or mobile version degrades to read-only where safe.

### 18. SQLite gate

The audit reported Python SQLite `3.50.4`. SQLite documents the WAL-reset issue through `3.51.2`, fixed in `3.51.3` with backports including `3.50.7` and `3.44.6`.

Rules:

- this does not block mock development or Android read-only UI;
- remote read-only pilot may proceed only when it does not add unsafe database mutation authority;
- production mobile write controls remain disabled until every database-opening process uses a fixed runtime and passes backup, integrity, concurrency, restart, and rollback tests;
- `hermes update --yes` is not accepted as an unverified SQLite fix.

Source: [SQLite WAL-reset bug](https://sqlite.org/wal.html#the_wal_reset_bug).

---

## Frontier

The canonical frontier is tracked in GitHub:

1. [Publish and verify the consolidated Hermes Mobile foundation](https://github.com/egawilldoit/hermes-mobile/issues/3)
2. [Build the Android read-only Command Center vertical slice](https://github.com/egawilldoit/hermes-mobile/issues/4)
3. [Close administrator recovery, credential rotation, and secret-persistence gates](https://github.com/egawilldoit/hermes-mobile/issues/5)
4. [Prove the initial chat-surface reuse boundary](https://github.com/egawilldoit/hermes-mobile/issues/6)
5. [Deploy Cloudflare enrollment, Tunnel, real-IP, and origin protection](https://github.com/egawilldoit/hermes-mobile/issues/7)
6. [Deploy the read-only sidecar and mobile-control database](https://github.com/egawilldoit/hermes-mobile/issues/8)
7. [Prove notification delivery, rotation, suppression, and outage behavior](https://github.com/egawilldoit/hermes-mobile/issues/9)
8. [Prove the exact Hermes approval schema and operation binding](https://github.com/egawilldoit/hermes-mobile/issues/10)
9. [Resolve the SQLite runtime and gated Hermes update pipeline](https://github.com/egawilldoit/hermes-mobile/issues/11)
10. [Validate the signed Samsung pilot lifecycle and device-integrity policy](https://github.com/egawilldoit/hermes-mobile/issues/12)

Dependency order is staged rather than implied by issue number:

```text
foundation
  → Android read-only UI
  → credentials/admin recovery + chat proof
  → Cloudflare + read-only sidecar/database
  → notifications + Samsung remote read-only pilot
  → governed chat/run controls
  → SQLite/update + approval proof
  → approvals/job controls + final Samsung lifecycle
```

---

## Not yet specified

- fully native chat replacement after pilot evidence;
- organization/invitation management;
- per-tenant Hermes profile/instance isolation;
- Google Play Internal Testing/production and Play Integrity enforcement;
- iOS lifecycle, signing, and distribution;
- richer file preview and project/worktree controls;
- voice interaction;
- analytics beyond operational and security audit needs.

---

## Out of scope for the MVP

- iOS release;
- public consumer distribution;
- arbitrary remote shell;
- sudo/root/infrastructure administration;
- infrastructure secret management;
- direct database inspection or mutation;
- session-wide or permanent mobile command approval;
- replacing Hermes scheduler/session/run/memory/execution engines;
- a second Hermes runtime in this repository;
- multiple production Hermes instances in Release One;
- full multi-user organization administration;
- autonomous merge, deployment, or VM repair from mobile.

---

## Destination checklist

- [ ] Consolidated implementation branch is pushed, reviewed, and reproducibly tested.
- [ ] Android read-only vertical slice passes mobile and sidecar tests.
- [ ] Administrator recovery and fresh-session privilege state are proven.
- [ ] All exposed credentials are rotated/revoked and secret persistence is durable.
- [ ] Chat reuse boundary is proven on Android.
- [ ] Cloudflare Access/Tunnel, real IP, caching, streaming, and origin protection pass.
- [ ] Sidecar runs loopback-only under the dedicated account with least-privilege database access.
- [ ] No master/service/infrastructure secret reaches the APK, WebView JS, logs, or diagnostics.
- [ ] Read-only state survives disconnect, suspension, restart, and replay gaps.
- [ ] Notification token rotation, receipts, suppression, redaction, quiet hours, and outage behavior pass.
- [ ] Device revocation and compromised-device policy pass.
- [ ] Governed chat/run mutations are explicit, compatible, idempotent, and reconciled.
- [ ] Exact approval evidence and device-bound operation signing pass.
- [ ] SQLite and gated Hermes update/rollback gates pass.
- [ ] Signed APK passes the complete Samsung lifecycle matrix.

---

## Primary references

### Planning

- [Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md)
- [To-spec skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)

### Hermes

- [API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Programmatic Integration](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md)
- [API implementation](https://github.com/NousResearch/hermes-agent/blob/main/gateway/platforms/api_server.py)
- [Desktop architecture](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/README.md)

### Expo and React Native

- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/)
- [Expo authentication](https://docs.expo.dev/guides/authentication/)
- [Expo SecureStore SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/)
- [Expo LocalAuthentication SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/local-authentication/)
- [Expo Notifications SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/)
- [Expo Internal Distribution](https://docs.expo.dev/build/internal-distribution/)
- [React Native WebSocket](https://reactnative.dev/docs/global-WebSocket)
- [React Native AppState](https://reactnative.dev/docs/appstate)

### Cloudflare, data, runtime, and Android security

- [Cloudflare One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare original visitor IP](https://developers.cloudflare.com/support/troubleshooting/restoring-visitor-ips/restoring-original-visitor-ips/)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Fastify ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/)
- [SQLite WAL-reset bug](https://sqlite.org/wal.html#the_wal_reset_bug)
- [Android Play Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts)
- [Docker post-install security warning](https://docs.docker.com/engine/install/linux-postinstall/)
