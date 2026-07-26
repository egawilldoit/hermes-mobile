# Hermes Mobile Wayfinder Map

**Status:** Direction established; implementation and operational evidence gates remain  
**Last updated:** 2026-07-26  
**Repository:** `egawilldoit/hermes-mobile`  
**Destination:** A secure Android private-pilot application that lets the operator observe and govern the Hermes Agent running on the `openclaw` VM without placing Hermes master credentials, unrestricted shell access, or infrastructure secrets on the phone.

## How to read this document

This is the durable Wayfinder map for Hermes Mobile. It captures:

- the destination;
- the verified current state;
- the decisions already made;
- the remaining evidence gates on the frontier;
- the fog that belongs to later releases; and
- the work explicitly ruled out of the MVP.

The map follows the intent of Matt Pocock's [Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md): decisions are separated from implementation work, the destination fixes scope, and unresolved work is kept on a visible frontier rather than hidden inside a large implementation prompt.

---

## Destination

Deliver a private Android MVP for one operator on one production Hermes installation. The application must provide a native Command Center, read and manage Hermes sessions/runs/jobs through governed interfaces, surface urgent alerts, support full-screen evidence-based approvals, and remain safe across mobile disconnection, app suspension, Hermes restarts, and sidecar restarts.

The destination is reached only when the app is installed and validated on the operator's Samsung device, all remote access passes through Cloudflare Tunnel and a hardened sidecar, no Hermes master credential exists on the phone, and all governed write operations satisfy the security and evidence gates in the MVP specification.

---

## Notes

### Operating principles

1. **Hermes remains the execution authority.** Hermes owns sessions, messages, runs, jobs, tool execution, model selection, skills, and native run state.
2. **The mobile app is a governed control plane, not another agent runtime.** It may expose an allowed Hermes capability, but it must not duplicate Hermes' workflow engine or database.
3. **The sidecar is a security boundary, not a generic proxy.** It authenticates devices, enforces explicit permissions, protects the Hermes master key, relays events, sends notifications, and records mobile-owned audit data.
4. **Unknown capabilities fail closed.** A new Hermes endpoint or capability is unavailable until explicitly classified and tested.
5. **Production uncertainty is shown, not hidden.** A timed-out mutation is reconciled before retry; an unknown outcome is never presented as failure or success.
6. **No direct Hermes SQLite access.** Mobile and sidecar integrations use supported Hermes HTTP/SSE interfaces only.
7. **Build in stages.** Read-only Android vertical slice first, then governed chat/run controls, then approvals and job controls after the operational gates pass.
8. **Preserve the existing app.** The Expo application created in `/home/ubuntu/hermes-mobile` is the canonical mobile project; it is not to be replaced by a new scaffold.

### Source classes

This map distinguishes three kinds of evidence:

- **Repository facts:** visible in the GitHub repository, including [the current package manifest](../package.json) and [Expo configuration](../app.json).
- **VM evidence:** supplied by the 2026-07-26 Hermes Mobile audit and remediation reports generated on `openclaw`, including the exact installed Hermes commit, endpoint probes, service state, security findings, and remediation results.
- **Product decisions:** explicitly selected during the Hermes Mobile planning conversation on 2026-07-26.

Where an item is user-reported but not yet visible in GitHub, it is marked accordingly.

---

## Current reality

### GitHub-visible state

At the time this map was written, GitHub `main` contains the original React Native Reusables Expo template:

- Expo `~56.0.13`;
- React Native `0.85.3`;
- React `19.2.3`;
- Expo Router `~56.2.12`;
- NativeWind and React Native Reusables;
- portrait orientation;
- typed Expo Router routes enabled;
- no Android package identifier configured yet;
- no production authentication, notification, or Hermes connection configured.

The repository evidence is available in [package.json](../package.json), [app.json](../app.json), and [the initial README](../README.md).

### User-reported local repository state

The operator reported that the VM-local branch `feature/hermes-sidecar-integration` contains three additional local commits that are not yet pushed:

- repository boundary and documentation;
- the hardened Hermes Mobile sidecar;
- shared contracts and a mock mobile API client.

The reported local structure is:

```text
hermes-mobile/
├── app/                         # Expo Router application
├── components/                  # React Native Reusables components
├── lib/                         # mobile utilities and typed API client
├── services/hermes-sidecar/     # Fastify sidecar
├── packages/contracts/          # portable shared contracts
├── docs/
└── reports
```

The sidecar is reported to have 96 passing tests, mock mode enabled by default, write actions disabled, and no production deployment. This state must be pushed and verified before it becomes repository-authoritative.

### Verified Hermes runtime direction

The VM audit established that the installed Hermes gateway exposes a mobile-compatible HTTP/SSE control surface on loopback port `8642`, including:

- health and detailed readiness;
- machine-readable capabilities;
- models, skills, and toolsets;
- session CRUD, messages, forking, and streaming chat;
- run creation, status, SSE events, stop, and approval;
- scheduled-job CRUD and controls.

The exact audit reported Hermes commit `92549c9a6e6e7c03a9cb945a2c4e75179a0e2d7d` and version `0.19.0`. The API server itself has no WebSocket route; rich TUI JSON-RPC/WebSocket is a separate Hermes interface. The official protocol distinction is documented in [Hermes Programmatic Integration](https://github.com/nousresearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md) and [Hermes API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md).

### Verified operational posture

The remediation work reportedly completed the following:

- removed unrestricted `NOPASSWD` sudo;
- removed the operator from the Docker group;
- added staged systemd hardening to Hermes Gateway;
- corrected unsafe permissions on secret-bearing files;
- sanitized the PM2 dump;
- removed secret-bearing shell-history entries;
- reduced disk usage from roughly 82% to 64%;
- added nginx rate-limit zones and SSE buffering controls;
- created the unprivileged `hermes-sidecar` account;
- disabled the automatic daily Hermes update timer.

Remaining operational gates include credential rotation, durable PM2 secret handling or migration, Cloudflare dashboard configuration, SQLite runtime remediation before production write operations, and a safe candidate/current/previous Hermes update pipeline.

---

## Decisions so far

### 1. Product boundary — governed operator, not remote root

Hermes Mobile is a **Governed Operator** application.

The MVP may:

- observe Hermes and VM health;
- browse sessions and messages;
- chat through approved Hermes interfaces;
- start and stop governed runs;
- review and resolve supported approvals;
- view, run, pause, and resume scheduled jobs;
- receive urgent operational alerts.

The MVP may not:

- expose arbitrary shell execution;
- expose a generic upstream proxy;
- approve sudo/root operations;
- manage infrastructure secrets;
- read or write Hermes SQLite directly;
- become a second scheduler, session engine, or execution database.

### 2. Release model — one operator, multi-user-safe foundations

Release One is for the operator alone, but all mobile-owned records and authorization decisions must carry explicit principal, device, and Hermes-instance identity. No mobile-owned table may assume a singleton user or singleton Hermes installation.

Team invitations, organization management, and multiple concurrently authorized humans are deferred, but the Release One schema must not prevent them.

### 3. Platform — Android private pilot

The first pilot is Android only and will be validated on the operator's modern Samsung device running Android 14 or later.

The intended support floor is Android 10/API 29 unless the current Expo SDK establishes a stricter supported minimum. Android-specific lifecycle, notification channels, deep links, biometrics, signing, and battery-management behavior are release requirements. iOS must not block the MVP.

The pilot distribution mechanism is an internally distributed signed APK. Expo documents that an Android internal-distribution profile produces an installable APK, while an AAB is used for Google Play distribution: [Expo Internal Distribution](https://docs.expo.dev/build/internal-distribution/).

### 4. Canonical repository — Hermes Mobile remains separate

`egawilldoit/hermes-mobile` is the canonical product repository. The Android application, mobile sidecar, and portable shared contracts belong together here and remain separate from EGA House Platform.

The existing Expo app is preserved. The project is not to be re-created, and it should not be restructured into a monorepo merely for appearance.

### 5. Native-versus-reused UI boundary

Native screens own the sensitive and operational surfaces:

- Command Center;
- alerts;
- approvals;
- health and diagnostics;
- job controls;
- device/session security.

The initial chat surface may reuse the existing Hermes WebUI in a hardened WebView because it already understands Hermes chat behavior. Direct reuse of Hermes Desktop's Electron application is deferred; Electron-specific filesystem, window, updater, PTY, and IPC responsibilities are not appropriate for the Android shell.

The open Hermes mobile work and `apps/shared` remain references, not an assumed production dependency. Reuse requires a separate proof that the exact renderer and transport can run safely with user-scoped credentials and without Electron coupling.

### 6. Network model — Cloudflare Access and Tunnel

The selected production path is:

```text
Android application
  → Cloudflare edge
  → Cloudflare Tunnel
  → loopback-only Hermes Mobile sidecar
  → loopback-only Hermes API
```

No new public VM listening port is required. The mobile sidecar binds to `127.0.0.1:8790`.

Enrollment is protected by Cloudflare Access and an approved-email policy. Cloudflare's OTP flow sends a single-use PIN to an allowed email and the PIN expires after ten minutes: [Cloudflare One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/).

The origin must validate the signed `Cf-Access-Jwt-Assertion`, including signature, issuer, and audience, instead of trusting the header or browser cookie alone: [Cloudflare Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

### 7. Authentication — Cloudflare enrollment plus trusted-device session

Cloudflare Access proves the operator's identity during enrollment; it is not used as the permanent API credential for every native request.

The target flow is:

```text
Cloudflare Access email verification
  → one-time authorization code bound to PKCE
  → trusted-device registration
  → short-lived sidecar access token
  → rotating refresh token
  → authorized Hermes operation
```

Defaults:

- authorization code: 60 seconds, single use;
- access token: 10 minutes;
- refresh token family: 30 days;
- refresh-token reuse: revoke the token family and device session;
- device loss: server-side revocation removes refresh access and push registration.

Small device secrets and tokens are stored with Expo SecureStore, not AsyncStorage. Expo documents SecureStore as encrypted native storage intended for small secrets and tokens: [Expo SecureStore](https://docs.expo.dev/develop/user-interface/store-data/).

### 8. Sidecar boundary — explicit adapters only

The Node.js/TypeScript/Fastify sidecar is required because the Hermes API uses one powerful server credential and exposes terminal-capable agent behavior. The phone never receives that credential.

The sidecar owns:

- enrollment and trusted-device sessions;
- explicit route authorization;
- request/response validation;
- Hermes master-key custody;
- per-IP, principal, device, endpoint, and operation rate limits;
- SSE observation and mobile event relay;
- urgent alert creation and push delivery;
- allowlisted VM health;
- idempotency and audit evidence;
- compatibility checks against Hermes capabilities.

The sidecar does not own:

- Hermes sessions or messages;
- Hermes run truth;
- Hermes scheduled-job truth;
- agent execution;
- a generic `/proxy/*` route;
- arbitrary URLs or commands;
- Hermes SQLite access.

Fastify maintains supported ecosystem plugins for route rate limiting and WebSocket support: [Fastify Ecosystem](https://fastify.dev/docs/v5.7.x/Guides/Ecosystem/).

### 9. Transport — REST/SSE upstream, mobile event relay

Hermes HTTP and SSE are the authoritative upstream transport for the MVP.

- REST is used for current state and bounded mutations.
- Hermes run/session SSE is used for foreground progress and server observation.
- The sidecar normalizes event streams into one authenticated mobile WebSocket connection when this improves React Native reconnection and multiplexing.
- Token deltas are not persisted to Supabase.
- Lifecycle milestones and alert state may be persisted.

Mobile events carry an event ID, sequence number, entity identity, authoritative state version where available, and timestamp. Reconnect uses `lastEventId`, bounded replay, deduplication, and current-state reconciliation.

When the Android app returns to the foreground, it refreshes authoritative state. React Native's `AppState` API reports foreground/background transitions and is explicitly suitable for notification and lifecycle handling: [React Native AppState](https://reactnative.dev/docs/appstate).

### 10. Data ownership — Hermes truth versus mobile-control truth

Hermes remains authoritative for:

- sessions and messages;
- runs and run events;
- scheduled jobs;
- native approval state;
- models, providers, skills, and toolsets;
- agent memory and execution configuration.

The mobile-control database owns:

- principals and trusted devices;
- refresh-token families and device public keys;
- push tokens and notification preferences;
- alerts and delivery receipts;
- watched-run references;
- mobile approval evidence;
- idempotency records;
- append-only audit events;
- Hermes-instance metadata;
- short-retention health snapshots.

The mobile application never receives a Supabase service-role key. Supabase documents that service-role keys bypass Row Level Security and must never be exposed to customers: [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

### 11. Authority matrix — capability plus risk policy

The mobile application may expose a Hermes capability only through an explicit sidecar permission.

| Capability | MVP policy |
|---|---|
| View health, capabilities, models, skills, toolsets | Allowed |
| View sessions and messages | Allowed |
| Create/resume/fork session | Allowed in governed-control stage |
| Send chat prompt | Allowed in governed-control stage |
| Start normal governed run | Allowed in governed-control stage |
| Stop/cancel run | Explicit confirmation |
| List jobs | Allowed |
| Run job now | Biometric step-up |
| Pause/resume job | Explicit confirmation |
| Create/edit job | Deferred unless separately accepted |
| Delete job or session | Biometric plus typed confirmation; may be deferred |
| Approve exact operation once | Biometric step-up |
| Deny approval | Allowed after evidence review |
| Approve for session/always | Not exposed in initial MVP |
| Sudo/root approval | Prohibited |
| Arbitrary shell or VM administration | Prohibited |
| Unknown capability | Denied by default |

### 12. Approval contract — evidence bound to one exact operation

A biometric prompt alone is not approval evidence. The displayed decision must be cryptographically and transactionally bound to the exact operation.

An approval request records:

- approval identity;
- Hermes instance, run, and session identity;
- tool and canonical arguments;
- command and working directory when applicable;
- affected resources and blast radius;
- risk classification;
- requested and expiry timestamps;
- operation digest;
- current run state/version where Hermes exposes one.

The flow is:

```text
urgent alert
  → open full approval screen
  → refresh authoritative state
  → display exact evidence
  → biometric step-up
  → device signs server challenge and operation digest
  → sidecar verifies device, expiry, digest, and current state
  → sidecar submits approve-once or deny
  → reconcile final Hermes state
  → append audit event
```

Duplicate taps reuse an idempotency key. A timeout triggers reconciliation, not an automatic retry. If the operation or run state changed, the approval is stale and a new review is required.

### 13. Biometrics — risk-based, not universal

No biometric prompt is required for ordinary viewing, chat, or starting a normal governed run.

Biometric step-up is required for:

- approving an exact tool/command operation once;
- manually running a scheduled job;
- other high-risk mutations explicitly classified by policy.

Stopping a run and pausing/resuming a job require explicit confirmation; destructive deletion may require biometrics plus typed confirmation.

Expo LocalAuthentication provides Android Biometric Prompt integration: [Expo LocalAuthentication](https://docs.expo.dev/versions/v54.0.0/sdk/local-authentication/).

### 14. Notifications — alert inbox is authoritative

The MVP uses Expo Push Service on Android, backed by FCM credentials, for urgent events. Push is best-effort delivery; the server-side alert record is authoritative.

Urgent event classes are:

- approval required;
- run failed or blocked;
- Hermes unavailable or critically degraded;
- scheduled job failure;
- authentication/security event;
- critical disk or database event.

Routine successes appear in the application but do not interrupt the operator.

Notification contents are redacted. Lock-screen text is generic and contains an opaque alert ID, not commands, prompts, repositories, paths, tool arguments, or raw errors. Tapping opens the authoritative screen and refreshes current state.

Android channels separate approvals, failures, system-critical alerts, and routine activity. Expo documents Android notification channels, token-change listeners, and the need for a development build for remote notifications on modern SDKs: [Expo Notifications](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/).

### 15. Command Center — operational priority order

The home screen is a Command Center ordered by operational urgency:

1. pending approvals;
2. failed or blocked runs;
3. active runs;
4. Hermes and VM health;
5. recent sessions;
6. scheduled jobs;
7. quick entry to chat.

The read-only vertical slice initially renders the same hierarchy with mutating controls absent or explicitly disabled.

### 16. Update compatibility — no blind daily promotion

The previous daily update timer has been disabled. Production Hermes remains pinned until a candidate/current/previous promotion pipeline exists.

Candidate promotion requires:

- no active run or pending approval;
- adequate disk and healthy current service;
- isolated candidate runtime and state;
- detailed health and capability checks;
- REST/SSE contract tests;
- sidecar compatibility tests;
- WebUI compatibility tests;
- tested rollback to the previous version.

An unsupported Hermes version puts the mobile application into read-only mode and disables write actions.

### 17. SQLite — operational gate before production write controls

The audit reported Python's SQLite runtime as `3.50.4`, while SQLite documents a WAL-reset corruption defect affecting releases through `3.51.2`, with backported fixes including `3.50.7` and a fix in `3.51.3`: [SQLite WAL documentation](https://sqlite.org/wal.html).

This does not prevent mock development or the read-only mobile UI, but production mobile write controls remain gated until every process that opens Hermes databases uses a fixed runtime and passes backup, integrity, concurrency, restart, and rollback tests.

---

## Frontier — work that can be specified now

These are the next takeable work packages. They are implementation/evidence tasks, not reopened product decisions.

### Push and verify the consolidated repository branch

**Question resolved by evidence:** Does GitHub contain the same sidecar, contracts, documentation, and passing tests reported on the VM-local branch?

Completion evidence:

- branch pushed;
- commit SHAs visible;
- CI or reproduced test output confirms the sidecar suite;
- no production secrets in the branch.

### Build the Android read-only vertical slice

**Question resolved by evidence:** Can the existing Expo app consume shared/mock contracts and provide the intended Command Center information architecture without touching production?

Completion evidence:

- protected app shell;
- Command Center, sessions, jobs, alerts, and diagnostics screens;
- loading, empty, stale, offline, and error states;
- event reconnection and foreground refresh;
- mobile typecheck/lint/tests pass;
- all sidecar tests remain passing.

### Complete credential rotation

**Question resolved by evidence:** Are all credentials that appeared in unsafe files, PM2 state, backups, or shell history replaced and old values revoked?

Completion evidence:

- provider-by-provider rotation ledger;
- each replacement tested before old credential revocation;
- no old value in runtime configuration, process snapshots, logs, or backups.

### Deploy and validate Cloudflare enrollment and Tunnel

**Question resolved by evidence:** Does the production path enforce approved-email enrollment, signed Access JWT verification, no origin bypass, no caching of API/stream responses, and safe WebSocket/SSE behavior?

Completion evidence:

- unauthorized and authorized tests;
- issuer/audience/signature verification;
- sidecar remains loopback-only;
- origin bypass test fails;
- stream latency and reconnect test passes.

### Deploy the sidecar in read-only mode

**Question resolved by evidence:** Can the hardened sidecar run under its dedicated account, expose explicit read-only adapters, use mobile-owned storage, and preserve current Hermes/WebUI behavior?

Completion evidence:

- systemd and filesystem review;
- no sudo/Docker/Hermes-SQLite access;
- unknown routes denied;
- master key never returned or logged;
- revocation and rate-limit tests;
- rollback tested.

### Prove the exact approval event and operation binding

**Question resolved by evidence:** Does the installed Hermes version expose enough stable evidence to bind a mobile decision to the exact operation that will execute?

Completion evidence:

- captured safe approval event schema;
- operation digest and expiry implemented;
- approve-once/deny only;
- stale, duplicate, timeout, and changed-state tests;
- audit evidence verified.

### Resolve SQLite runtime and safe update promotion

**Question resolved by evidence:** Can Hermes and every database-opening companion process run a fixed SQLite runtime and survive candidate promotion/rollback without integrity loss?

Completion evidence:

- fixed runtime version for each process;
- copied-database concurrency and restart tests;
- production backup and integrity checks;
- candidate/current/previous promotion and rollback test.

### Validate the full pilot on the Samsung device

**Question resolved by evidence:** Does the signed Android build remain correct through real mobile lifecycle and network behavior?

Completion evidence:

- installable private APK;
- Wi-Fi/mobile switching;
- app background, termination, and phone reboot;
- sidecar/Hermes restart;
- expired/revoked tokens;
- notification permission denied and token rotation;
- approval expiry and duplicate tap;
- no secret leakage in logs or diagnostics.

---

## Not yet specified

These areas remain in scope for the product's future but are deliberately beyond the current frontier:

- native replacement of the embedded/reused chat renderer after the first pilot provides real usability evidence;
- organization and invitation management for additional operators;
- per-tenant Hermes profile/instance isolation strategy for multiple users;
- Google Play Internal Testing and store-release governance;
- iOS lifecycle, signing, notifications, and distribution;
- richer file preview and project/worktree controls;
- voice interaction;
- long-term analytics and usage reporting beyond operational audit needs.

---

## Out of scope for this MVP

- iOS release;
- public consumer distribution;
- arbitrary remote shell;
- sudo/root or infrastructure administration from the phone;
- secret management from the phone;
- direct database inspection or mutation;
- permanent `always allow` command approvals;
- replacing Hermes' scheduler, session store, run engine, or memory system;
- creating a second Hermes runtime in the mobile repository;
- supervising multiple production Hermes installations in Release One;
- full multi-user organization administration;
- autonomous merge, deployment, or infrastructure repair from the mobile app.

---

## Destination completion checklist

The Wayfinder destination is complete only when all are true:

- [ ] Consolidated branch and tests are visible in GitHub.
- [ ] Android application implements the complete MVP information architecture.
- [ ] Sidecar is deployed under a dedicated unprivileged identity.
- [ ] Cloudflare Access enrollment and Tunnel are manually validated.
- [ ] Hermes master credentials never leave the VM.
- [ ] Exposed credentials are rotated and revoked.
- [ ] No direct public mobile origin bypass exists.
- [ ] Read-only state survives disconnect and restart through reconciliation.
- [ ] Notifications are redacted and alert state is authoritative in-app.
- [ ] Approval evidence is bound to the exact current operation.
- [ ] Mobile write actions are guarded by idempotency, stale-state, and audit controls.
- [ ] SQLite and Hermes update compatibility gates pass.
- [ ] A signed APK passes the real Samsung lifecycle test matrix.
- [ ] Rollback is tested for sidecar, Hermes, and mobile compatibility.

---

## Primary references

### Planning method

- [Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md)
- [To-spec skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)

### Hermes

- [Hermes API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Hermes Programmatic Integration](https://github.com/nousresearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md)
- [Hermes API implementation](https://github.com/NousResearch/hermes-agent/blob/main/gateway/platforms/api_server.py)

### Expo and React Native

- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/)
- [Expo SecureStore](https://docs.expo.dev/develop/user-interface/store-data/)
- [Expo LocalAuthentication](https://docs.expo.dev/versions/v54.0.0/sdk/local-authentication/)
- [Expo Notifications for SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/)
- [Expo Internal Distribution](https://docs.expo.dev/build/internal-distribution/)
- [React Native AppState](https://reactnative.dev/docs/appstate)

### Edge, identity, and data security

- [Cloudflare One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Fastify ecosystem](https://fastify.dev/docs/v5.7.x/Guides/Ecosystem/)
- [SQLite Write-Ahead Logging and WAL-reset defect](https://sqlite.org/wal.html)
