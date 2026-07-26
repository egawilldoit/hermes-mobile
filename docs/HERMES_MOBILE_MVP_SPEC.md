# Hermes Mobile MVP Specification

**Status:** Ready for staged ticketing; production capabilities remain gated by evidence  
**Version:** 1.1  
**Date:** 2026-07-26  
**Product:** Hermes Mobile  
**Primary platform:** Android private pilot  
**Canonical Wayfinder issue:** [Wayfinder Map — Hermes Mobile Governed Operator MVP](https://github.com/egawilldoit/hermes-mobile/issues/2)  
**Companion decision record:** [Hermes Mobile Wayfinder Map](./HERMES_MOBILE_WAYFINDER.md)

This specification follows the [to-spec skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md). It synthesizes decisions already made, distinguishes verified facts from reported local implementation, defines the highest useful behavioral test seams, and avoids inventing a second Hermes runtime.

---

## Problem Statement

The operator runs Hermes Agent continuously on the `openclaw` VM. Hermes already owns agent sessions, messages, tools, runs, scheduled jobs, memory, skills, model/provider selection, and approval behavior.

Supervising this work safely from Android currently requires switching between web interfaces, Slack or other messaging platforms, SSH, and infrastructure dashboards. None of those surfaces alone provides a trusted mobile control plane with:

- an operationally prioritized Command Center;
- durable operator and device identity;
- revocable device sessions;
- scoped authorization instead of the Hermes master bearer key;
- reliable stream reconnect and current-state reconciliation;
- redacted urgent push notifications;
- full-screen evidence-based approvals;
- risk-based biometric step-up;
- idempotent mutations and unknown-outcome handling;
- mobile audit evidence;
- compatibility protection when Hermes changes.

Putting the Hermes API key in an APK is unacceptable. Hermes documents that its API exposes the full agent toolset, including terminal and file operations. A generic proxy would turn the mobile app into a remote shell. Reading Hermes SQLite or copying Hermes sessions/jobs into Supabase would create a second source of truth.

The VM audit and remediation also leave production gates that the product plan must not hide:

- 19 reported exposed credentials still require rotation and old-value revocation;
- interactive administrator recovery and fresh-session privilege state must be proven;
- PM2/WebUI secret persistence must be made durable;
- Cloudflare Access/Tunnel and origin protection are not yet deployed;
- the sidecar code is reported locally but not deployed;
- SQLite `3.50.4` was reported and production write controls remain blocked until a fixed runtime is proven;
- the automatic Hermes update timer is disabled pending compatibility and rollback controls.

The user needs one Android application that makes Hermes observable and governable without making the phone, sidecar, WebView, or mobile-control database another Hermes runtime or an infrastructure-administration surface.

---

## Solution

Build Hermes Mobile as a **Governed Operator** Android control plane around the existing Hermes installation.

### System boundaries

1. **Hermes Agent** remains authoritative for sessions, messages, runs, jobs, native approvals, tools, models, skills, memory, and execution.
2. **Hermes Mobile sidecar** protects Hermes credentials, authenticates trusted devices, exposes explicit operations, relays events, generates alerts, and stores mobile-owned security/audit state.
3. **Hermes Mobile Android app** provides the native Command Center, operational screens, device session, diagnostics, notification handling, and evidence-based decisions.
4. **Cloudflare Access and Tunnel** provide approved-email enrollment and an outbound-only edge path to the loopback sidecar.
5. **Mobile-control Postgres/Supabase schema** stores only device, token, alert, notification, idempotency, compatibility, health, and audit records.

### Release One shape

- one operator;
- one production Hermes VM;
- Android private APK;
- multi-user-safe and multi-instance-safe identifiers;
- native operational/sensitive screens;
- chat reuse or native chat selected only after Android proof;
- read-only delivery before mutations;
- write actions enabled by explicit release-stage flags;
- approvals and manual job execution enabled only after SQLite, approval-schema, biometric-signature, audit, and update gates pass.

### Fail-closed behavior

- unknown sidecar routes return `404`;
- unknown Hermes capabilities are unavailable;
- incompatible Hermes/app versions disable affected mutations;
- stale approvals cannot execute;
- timed-out mutations reconcile before retry;
- push is advisory and in-app state is authoritative;
- missing evidence disables the action rather than weakening policy.

---

## Current Implementation Baseline

### GitHub-visible baseline

GitHub `main` currently contains the original Expo template:

- Expo `~56.0.13`;
- React Native `0.85.3`;
- React `19.2.3`;
- Expo Router `~56.2.12`;
- NativeWind and React Native Reusables;
- no visible sidecar or production connection on `main`.

### Operator-reported local branch

The operator reported local branch `feature/hermes-sidecar-integration` with commits:

- `1e4e37a` — repository structure;
- `a6b478d` — hardened sidecar;
- `806669d` — shared contracts, mock API client, and docs.

Reported results:

- 27 sidecar files;
- 96/96 tests passing;
- mock integration enabled by default;
- mobile write actions disabled;
- no production deployment;
- no EGA House coupling.

Reported routes/defaults:

- `POST /register`;
- `POST /token/refresh`;
- `DELETE /devices/:id`;
- `GET /v1/mobile/events?lastEventId=`;
- 10-minute access token;
- 30-day refresh family;
- refresh-token rotation and reuse detection;
- 60 requests/minute general default;
- 5 refresh attempts/minute default;
- 3 concurrent WebSockets/device;
- replay up to 100 events.

These are not repository-authoritative until issue [Publish and verify the consolidated Hermes Mobile foundation](https://github.com/egawilldoit/hermes-mobile/issues/3) pushes and reproduces them.

Before remote pilot, the public mobile API must be versioned consistently. The existing local auth paths may be renamed or aliased under `/v1/auth/*` in one coordinated client/server/OpenAPI change. No pre-pilot backward-compatibility promise is required.

---

## Goals and Success Measures

### Goals

1. Give the operator one Android Command Center for important Hermes state.
2. Remove the need for SSH for ordinary governed actions.
3. Keep Hermes and infrastructure master credentials off the phone and out of WebView JavaScript.
4. Preserve Hermes as the only execution/workflow authority.
5. Deliver urgent alerts without exposing sensitive lock-screen content.
6. Make every enabled mutation scoped, current, idempotent, auditable, and reconcilable.
7. Survive network switching, Android suspension, process death, and service restart without inventing state.
8. Preserve a path to additional users and Hermes installations without singleton schema assumptions.
9. Avoid risky VM changes during code-only phases; every production change is manual/reviewed with backup and rollback.

### MVP success measures

- Signed APK installs and runs on the operator's Samsung Android 14+ device.
- Command Center obtains current state through Cloudflare Tunnel and the sidecar.
- APK, app storage, WebView, logs, and diagnostics contain no Hermes, Supabase service-role, Cloudflare service, provider, GitHub, Linear, Slack, or infrastructure master secret.
- Revoked device cannot refresh or call the sidecar.
- Foreground reconciliation succeeds after network switching and process suspension.
- Event reconnect does not duplicate lifecycle state.
- Urgent alert exists in the database before/beside push delivery.
- Approval decisions are approve-once or deny, bound to exact current evidence, and audited.
- Duplicate taps return the original idempotent result.
- Unknown mutation outcome is visibly reconciled.
- Sidecar/Hermes/app compatibility and rollback procedures are tested.
- All security-negative and Samsung lifecycle tests pass.

### Initial performance targets

Measured on the real Samsung through Cloudflare:

- cached Command Center shell visible within 1 second after unlock;
- fresh health/alert summary within 3 seconds on a healthy network;
- mobile relay median overhead below 250 ms beyond upstream event arrival at the sidecar;
- reconnect state visible within 1 second of detected loss;
- first reconnect attempt around 250 ms, then bounded exponential backoff with jitter;
- no unbounded event queue, replay buffer, transcript cache, or health history.

Targets are acceptance measurements, not current claims.

---

## Actors

### Operator

The only approved Release One human.

### Trusted Device

A registered Android installation with device identity, revocation state, protected refresh credentials, optional push registrations, and a server-known public key.

### Android App

Renders state and captures decisions. It is not authoritative for Hermes truth.

### Sidecar

Server-side identity, policy, compatibility, integration, notification, reconciliation, and audit boundary.

### Hermes Agent

Authoritative runtime on `openclaw`.

### Cloudflare Access

Enrollment identity gate for the approved email.

### Mobile-Control Database

Durable mobile-owned security/operational metadata only.

---

## User Stories

1. As the operator, I want one Command Center, so that I immediately understand whether Hermes needs attention.
2. As the operator, I want pending approvals prioritized, so that blocked work is resolved quickly.
3. As the operator, I want failed or blocked runs above routine activity, so that operational failures are visible first.
4. As the operator, I want active runs and their current state, so that long work does not appear invisible.
5. As the operator, I want liveness separated from detailed readiness, so that an online process is not mistaken for a healthy service.
6. As the operator, I want allowlisted VM health without shell access, so that disk/database/service risks are visible safely.
7. As the operator, I want recent sessions, so that I can find current work.
8. As the operator, I want session message history, so that I understand context before acting.
9. As the operator, I want session search/filter, so that large history remains usable.
10. As the operator, I want a governed fork operation, so that an alternative thread does not overwrite the original.
11. As the operator, I want governed chat, so that I can continue Hermes work remotely.
12. As the operator, I want streamed assistant/tool progress, so that long turns do not look frozen.
13. As the operator, I want to start a normal governed run, so that approved work can begin without SSH.
14. As the operator, I want explicit confirmation before stopping a run, so that accidental cancellation is reduced.
15. As the operator, I want `stopping` shown until execution exits, so that a stop request is not mistaken for completion.
16. As the operator, I want jobs listed with schedule, next run, last run, and result, so that automation health is visible.
17. As the operator, I want confirmation before pause/resume, so that schedule state changes are intentional.
18. As the operator, I want biometric step-up before manual job run, so that execution requires stronger proof.
19. As the operator, I want approval-required events to create urgent alerts, so that blocked work is surfaced.
20. As the operator, I want failures and critical health to alert me, so that I do not keep the app open.
21. As the operator, I want routine successes in-app without interrupting notifications, so that alerting remains meaningful.
22. As the operator, I want lock-screen content redacted, so that commands, prompts, paths, repositories, and tool arguments remain private.
23. As the operator, I want notification taps to fetch current authoritative state, so that stale push content cannot drive decisions.
24. As the operator, I want alerts marked open, acknowledged, and resolved, so that incident lifecycle is clear.
25. As the operator, I want repeated identical failures deduplicated and suppressed, so that alert storms do not hide new problems.
26. As the operator, I want configurable quiet hours, so that non-critical notifications respect my schedule.
27. As the operator, I want critical security/system policy explicit during quiet hours, so that suppression never silently hides required action.
28. As the operator, I want one approved-email enrollment through Cloudflare Access, so that no separate public password database is needed.
29. As the operator, I want enrollment once per trusted device, so that email OTP is not required on every launch.
30. As the operator, I want short-lived access and rotating refresh tokens, so that captured credentials have bounded value.
31. As the operator, I want refresh-token reuse to revoke the token family, so that theft fails closed.
32. As the operator, I want to revoke a lost device, so that it cannot regain access or receive push.
33. As the operator, I want refresh tokens and device keys in secure native storage, so that normal app storage does not expose them.
34. As the operator, I want deep links to contain only one-time code/state, so that tokens do not leak through link handling.
35. As the operator, I want an approval screen with exact tool/command/arguments/resources/risk/expiry, so that I understand the operation.
36. As the operator, I want only approve-once and deny in Release One, so that mobile cannot create permanent command policy.
37. As the operator, I want biometric-backed device signing for approval, so that a client boolean is not trusted as proof.
38. As the operator, I want approval bound to an operation digest and current state, so that changed work cannot reuse my decision.
39. As the operator, I want expired/changed approvals stale, so that obsolete operations cannot execute.
40. As the operator, I want duplicate taps idempotent, so that one action cannot execute twice.
41. As the operator, I want lost-response mutations reconciled, so that an already-applied action is not retried blindly.
42. As the operator, I want sensitive actions audited with principal/device/digest/outcome, so that mobile governance is traceable.
43. As the operator, I want stale/cached/offline indicators, so that old data is not mistaken for current truth.
44. As the operator, I want foreground refresh, so that Android suspension cannot leave enabled controls stale.
45. As the operator, I want reconnect and network-switch state visible, so that phone connectivity is not confused with Hermes health.
46. As the operator, I want replay gaps reconciled, so that missed, duplicate, or out-of-order events do not corrupt the UI.
47. As the operator, I want mutations disabled on unsupported versions, so that compatibility uncertainty fails closed.
48. As the operator, I want sanitized diagnostics with correlation IDs, so that failures can be investigated safely.
49. As the operator, I want a signed internal APK, so that the pilot can run without public store distribution.
50. As the operator, I want separate Android notification channels, so that approval/failure/system/routine preferences can differ.
51. As the operator, I want token changes and reinstall handled, so that notifications do not silently target an invalid registration.
52. As the operator, I want provider outage to preserve in-app alerts, so that push failure does not erase incidents.
53. As the operator, I want the pilot unsupported on rooted/compromised devices for high-risk controls, so that device compromise does not weaken approvals.
54. As a future operator, I want principal/device scoping, so that Release One does not prevent multi-user support.
55. As a future administrator, I want explicit Hermes-instance identity, so that one current VM does not become a singleton assumption.
56. As a security reviewer, I want unknown routes/capabilities denied, so that upstream additions do not expand authority silently.
57. As a security reviewer, I want proof the APK/WebView/logs contain no master credentials, so that client compromise does not expose the VM.
58. As a security reviewer, I want the sidecar without sudo, Docker, SSH keys, broad home access, or Hermes SQLite, so that compromise has bounded blast radius.
59. As a security reviewer, I want correct Cloudflare JWT and real-IP validation, so that identity/rate limits cannot be spoofed.
60. As an operator maintaining Hermes, I want candidate validation before promotion, so that updates do not silently break the mobile contract.
61. As an operator maintaining Hermes, I want active work to defer maintenance, so that restarts do not interrupt runs/approvals/delegations.
62. As an operator maintaining Hermes, I want tested rollback, so that incompatible updates can be reversed.
63. As the operator, I want production writes blocked until SQLite is fixed and validated, so that convenience does not amplify persistence risk.
64. As a developer, I want portable shared contracts, so that mobile/server agree without platform dependency leakage.
65. As a developer, I want mock mode for all initial screens, so that UI development does not require production access.
66. As a developer, I want the highest-level sidecar and Android seams tested, so that behavior—not private implementation—is verified.
67. As a developer, I want current local route/default claims verified after push, so that documentation does not fossilize unreviewed implementation.
68. As an operator, I want no risky VM configuration changes during UI/code stages, so that product development cannot damage the production host.

---

## MVP Scope and Delivery Stages

### Stage 0 — Repository and contract foundation

Included:

- canonical repository;
- preserved Expo app;
- sidecar module;
- portable contracts;
- typed mock API client;
- mock Hermes/event fixtures;
- safe defaults;
- unit/contract/security-negative tests.

Exit:

- reported local commits pushed;
- docs branch reconciled;
- exact route/OpenAPI contract reviewed;
- 96 sidecar tests and mobile/contract checks reproducible;
- no production secret.

### Stage 1 — Android read-only vertical slice

Included:

- mock sign-in/session shell;
- Command Center;
- health/readiness;
- sessions/messages;
- jobs;
- alerts;
- diagnostics;
- event state and foreground reconciliation;
- loading/empty/error/offline/stale/degraded states;
- no production connection or mutation.

Exit:

- Android app/simulator behavior tests pass;
- sidecar suite remains passing;
- no VM change.

### Stage 2 — Remote read-only pilot

Prerequisites:

- administrator recovery proven;
- fresh-session Docker privilege removal proven;
- credential rotation/revocation complete;
- durable WebUI/PM2 secret handling;
- Cloudflare configuration reviewed.

Included:

- loopback sidecar under dedicated identity;
- approved-email enrollment;
- trusted-device access/refresh/revocation;
- least-privilege mobile-control database;
- explicit read-only Hermes adapters;
- authenticated event relay;
- read-only alerts and push-token registration;
- Samsung remote lifecycle testing.

Exit:

- operator observes production Hermes securely;
- no mobile mutation path;
- no direct origin bypass;
- no master key on phone/WebView.

### Stage 3 — Governed chat and run controls

Included:

- accepted chat boundary from issue #6;
- session create/resume/fork where permitted;
- chat/run streaming;
- normal run creation;
- stop/cancel confirmation and reconciliation;
- ownership mapping;
- idempotency;
- unsupported-version read-only fallback.

Exit:

- all operations explicit, scoped, current, compatible, idempotent, auditable, and reconcilable after network loss.

### Stage 4 — Governed approvals and job controls

Prerequisites:

- fixed SQLite runtime for every database-opening process;
- candidate/current/previous update/rollback proven;
- exact approval event schema captured;
- device-signature proof tested.

Included:

- approve once and deny;
- full evidence and expiry;
- biometric-backed device signature;
- stale/duplicate/timeout/unknown-outcome behavior;
- manual job run with biometric step-up;
- job pause/resume confirmation;
- append-only audit.

Exit:

- full Governed Operator MVP passes end-to-end security/lifecycle matrix.

---

## Information Architecture

### Primary navigation

- Command
- Sessions
- Jobs
- Alerts
- Settings

Approvals use a dedicated full-screen route opened from Command, Alerts, or an opaque push deep link.

### Command Center priority

1. pending approvals;
2. failed/blocked runs;
3. active runs;
4. Hermes/VM health;
5. recent sessions;
6. jobs;
7. quick chat entry.

### Required screen states

- loading;
- empty;
- current;
- stale/cached;
- offline;
- dependency degraded;
- unauthorized/revoked;
- unsupported app/Hermes version;
- sanitized error with correlation ID.

No gated action silently fails. It is omitted or visibly disabled with reason.

---

## Implementation Decisions

### 1. Repository boundaries

Modules:

- Expo/React Native mobile app;
- Fastify/TypeScript sidecar;
- portable runtime-validatable contracts.

Shared contracts contain no Fastify, Node filesystem/database, Expo, or React Native implementation dependencies.

Preserve the current Expo 56/RN 0.85 baseline unless a separate tested upgrade is accepted.

### 2. Hermes authority

No canonical Hermes session/message/run/job copy is stored outside Hermes. The sidecar stores identifiers, watches, alert state, digests, compatibility, idempotency, and audit evidence only.

No direct Hermes SQLite access.

### 3. Explicit sidecar API

Representative reads:

- health and readiness;
- Hermes status/capabilities/models/skills/toolsets;
- session list/detail/messages;
- job list/detail;
- mobile alerts.

Representative identity operations:

- enrollment start/callback;
- one-time PKCE exchange;
- access refresh;
- device list/revocation;
- push token registration/rotation.

Governed operations, stage-disabled by default:

- session create/chat/fork;
- run create/stop;
- approval resolve;
- job run/pause/resume.

No arbitrary URL, upstream path, header forwarding, or command input.

### 4. Compatibility discovery

Sidecar checks:

- `/health`;
- `/health/detailed`;
- `/v1/capabilities`;
- observed Hermes version and required feature flags.

A compatible snapshot is required for mutations. Safe reads may continue when explicitly classified.

### 5. Network

Production:

```text
mobile-auth.egawilldoit.online → Access OTP → Tunnel → sidecar enrollment
mobile-api.egawilldoit.online  → Tunnel → sidecar device authorization
```

- sidecar `127.0.0.1:8790`;
- Hermes `127.0.0.1:8642`;
- signed Access JWT verified at enrollment origin;
- real client IP trusted only from Cloudflare ranges;
- no cache for auth/API/alerts/streams;
- proxy buffering off for streams;
- direct-origin bypass denied.

### 6. Enrollment and token policy

1. App creates PKCE verifier/challenge, state, device ID, and device keypair.
2. System browser opens Access-protected enrollment.
3. Sidecar validates Access JWT and approved email.
4. Sidecar creates 60-second single-use code bound to challenge/device/state.
5. Verified App Link returns code/state.
6. App exchanges code/verifier.
7. Sidecar registers device and issues access/refresh credentials.

Defaults:

- access: 10 minutes;
- refresh family: 30 days;
- rotate every successful refresh;
- store only refresh-token hashes server-side;
- old-token reuse revokes family;
- access token memory-resident where possible;
- refresh token and private key in SecureStore/Keystore;
- revocation removes refresh/push access.

### 7. Authorization

Permission matrix fields:

- scope;
- release stage;
- confirmation;
- biometric/device-signature requirement;
- idempotency;
- audit;
- compatibility;
- ownership/entity access.

Release One operator role does not bypass policy.

### 8. Rate limiting

Dimensions:

- edge/IP;
- principal;
- device;
- route/operation;
- refresh;
- approval;
- run creation;
- concurrent WebSocket/subscriptions.

Reported local defaults (60/min general, 5/min refresh, 3 WebSockets/device) are provisional until issue #3 verifies code and tests. Production limits are configurable and authenticated limits never depend only on IP.

### 9. Hermes transport

- REST for state/bounded mutation;
- SSE for chat/run progress;
- polling for reconciliation;
- capabilities for optional behavior.

Sidecar injects Hermes bearer key server-side and never returns/logs it.

### 10. Mobile event relay

One authenticated WebSocket may normalize Hermes lifecycle streams.

Envelope:

- event ID;
- bounded sequence;
- event type;
- Hermes instance;
- entity type/ID;
- occurrence timestamp;
- authoritative state version where available;
- redacted payload.

Relay:

- heartbeat;
- bounded replay (reported local default 100 events);
- `lastEventId`;
- deduplication;
- backpressure;
- slow-client disconnect;
- subscription authorization;
- current-state reconciliation after gaps.

No token-delta database writes.

### 11. Android lifecycle

Background:

- brief optional stream grace period;
- no assumption of permanent Android connection;
- sidecar remains monitor.

Foreground:

- refresh token if needed;
- reconnect event relay;
- reconcile health, alerts, active runs, jobs, and visible session;
- keep mutations disabled until current state is available.

### 12. Mobile-control data model

Logical tables:

- `mobile_principals`;
- `mobile_devices`;
- `mobile_refresh_tokens`;
- `hermes_instances`;
- `run_watches`;
- `mobile_approvals`;
- `mobile_alerts`;
- `push_tokens`;
- `notification_deliveries`;
- `notification_preferences`;
- `idempotency_records`;
- `audit_events`;
- `health_snapshots`.

Relevant records include principal, device where applicable, and Hermes instance.

Use non-public schema, dedicated role, least privilege, RLS defense in depth, append-only audit restrictions, and no service-role key in Android.

### 13. Audit and idempotency

Sensitive event fields:

- principal/device/instance;
- request/correlation ID;
- operation class/digest;
- idempotency key;
- decision/final outcome;
- timestamps;
- optional previous hash/current hash.

Mutation states:

- claimed;
- forwarded;
- completed;
- failed;
- outcome unknown;
- reconciled.

Same key/same payload returns original result. Same key/different payload is rejected.

### 14. Approval policy

Choices:

- approve once;
- deny.

Required checks:

- still pending;
- unexpired;
- operation digest matches;
- required run/session state unchanged;
- active device;
- device-signature proof succeeds;
- idempotency valid;
- required evidence complete.

Target Hermes mobile approval configuration after controlled validation: manual mode and roughly 300-second timeout. Current smart/60-second audit configuration is not accepted as final policy.

### 15. Biometric and device proof

- Expo LocalAuthentication invokes Android Biometric Prompt.
- Server does not trust `biometricSucceeded: true`.
- Keystore-protected device key signs server nonce + operation identity/digest.
- Sidecar verifies signature and device status.
- cancellation/failure denies action.

Private APK policy:

- non-rooted, locked-bootloader Samsung is required;
- suspected compromise disables high-risk controls;
- basic root detection is advisory;
- Play Integrity enforcement is deferred until compatible Play setup/distribution is accepted.

### 16. Notification and alert model

Provider:

- Expo Push Service backed by FCM;
- retain Expo/native token where available.

Channels:

- approvals;
- failures;
- system-critical;
- routine activity.

Lifecycle:

- open;
- provider accepted/rejected;
- opened;
- acknowledged;
- resolved.

Rules:

- token-change listener;
- reinstall/rotation handling;
- receipt processing and `DeviceNotRegistered` cleanup;
- generic body and opaque identifiers only;
- dedup by class + instance + entity + state version;
- default repeated-failure interrupt suppression 15 minutes;
- configurable quiet hours;
- provider outage keeps alerts authoritative;
- notification permission denial/force-stop documented.

### 17. Native/reused chat

Sensitive controls are native.

Initial chat implementation is decided by issue #6 after proof of:

- origin/navigation allowlist;
- credential handoff;
- no master/refresh credential in WebView JS;
- session/stream/tool behavior;
- keyboard/back/lifecycle/reconnect;
- measured latency and implementation cost.

A complete native rewrite is deferred until reuse proves insufficient.

### 18. Build/distribution

- Android internal signed APK;
- package ID target `online.egawilldoit.hermes` after collision validation;
- development/preview/production profiles;
- preview for private pilot;
- signing key backed up under operator control;
- FCM project/credentials owned by operator/project;
- remote notifications validated only in development/standalone build, not Expo Go;
- OTA disabled until signing/runtime/rollback/min-version policy proven;
- sidecar can require minimum app version and read-only fallback.

### 19. Hermes updates and SQLite

Automatic updates stay disabled.

Promotion:

```text
candidate → validated → current → previous
```

Requires:

- no active run, approval, or delegated work;
- isolated candidate;
- health/capabilities/REST/SSE tests;
- sidecar/WebUI compatibility;
- rollback proof.

Write controls require SQLite `3.50.7`, `3.51.3`, or another release containing the fix for every database-opening process, plus integrity/concurrency/restart/backup/rollback evidence.

`hermes update --yes` is not a presumed SQLite fix.

### 20. Feature flags

At minimum:

- Hermes integration mode;
- mobile write actions;
- push delivery;
- database mode;
- chat reuse;
- approval controls;
- job controls;
- required app/Hermes compatibility policy.

Development defaults remain mock/read-only. Production startup fails when required secure configuration is absent.

### 21. Error contract

Stable sanitized codes cover:

- auth required/expired;
- device revoked/untrusted;
- permission denied;
- step-up required;
- Hermes offline/degraded;
- capability/version unsupported;
- entity not found;
- state changed;
- approval expired/stale;
- action outcome unknown;
- stream disconnected/reconciling;
- push unavailable;
- database unavailable;
- update required.

Every operational error has correlation ID. Raw provider/tool/command/secret-bearing errors never reach Android.

---

## Non-Functional Requirements

### Security

- No master/service/infrastructure credential in APK, WebView JS, logs, diagnostics, deep links, or push.
- No generic proxy, arbitrary URL, shell, or command endpoint.
- Dedicated unprivileged sidecar identity with no sudo/Docker/SSH/Hermes SQLite/broad home access.
- Cloudflare Access JWT verified; real IP trusted only from Cloudflare.
- Unknown capability denied.
- Device compromise disables high-risk actions.
- High-risk decisions require current evidence and device-bound signature.
- Least-privilege database and RLS defense in depth.

### Reliability

- Sidecar monitors while phone is closed.
- Reconnect is bounded, idempotent, and reconciling.
- Push advisory; alert DB authoritative.
- Unknown mutation outcomes remain explicit.
- Compatible reads may survive dependency degradation while writes fail closed.

### Performance

- Prompt event forwarding; no per-token persistence.
- Pagination for lists.
- Bounded replay/queues/cache.
- Rate-limited catalog refresh.
- Short health retention.

### Privacy

- No sensitive lock-screen details.
- Audit contains normalized metadata, not full transcript/tool content.
- No third-party analytics receives Hermes conversation/tool content in MVP.

### Accessibility

- minimum Android touch targets;
- accessible labels/states;
- severity not color-only;
- announced loading/connection state;
- safe biometric cancel without bypass.

### Maintainability

- portable contracts;
- explicit adapters;
- behavior-level tests;
- durable decision docs/issues;
- incomplete privileged capabilities disabled by flags.

---

## Testing Decisions

### Philosophy

Test externally observable behavior and policy boundaries. Prefer the highest stable seams.

### Seam 1 — Mobile-facing sidecar contract

Run sidecar with test identity, test database, and deterministic Hermes fixtures/mock.

Validates:

- schemas;
- token issue/refresh/reuse/revocation;
- authorization/allowlist;
- rate limits;
- errors/redaction;
- relay/replay/dedup/backpressure;
- alerts/notifications;
- idempotency/audit;
- feature gates.

### Seam 2 — Android vertical slice

Render real navigation/screens against deterministic contracts.

Validates:

- protected routes;
- Command Center order;
- sessions/jobs/alerts/diagnostics;
- all state presentations;
- foreground reconciliation;
- absence of unauthorized controls;
- secret-free diagnostics.

### Seam 3 — Exact Hermes compatibility

Use exact supported version/candidate and disposable safe state.

Validates:

- health/readiness/capabilities;
- session/job reads;
- safe isolated run/event/stop;
- approval event schema;
- timeout/restart/unsupported-version behavior.

### Seam 4 — Real Samsung pilot

Validates:

- signing/install;
- App Links/enrollment/token persistence;
- biometrics/device key;
- notification channels/token rotation;
- Wi-Fi/mobile/airplane mode;
- background/termination/reboot/battery optimization/force-stop limitation;
- sidecar/Hermes restart;
- revocation/minimum version;
- compromised-device policy.

### Required security-negative tests

- missing/invalid/expired access token;
- revoked device;
- old refresh reuse;
- PKCE/state mismatch;
- forged/wrong-audience Access JWT;
- spoofed real-IP header from untrusted origin;
- unknown route;
- arbitrary Hermes path/upstream URL;
- oversized payload/header injection/path traversal;
- secret log/response leak;
- master-key exposure;
- unauthorized event subscription;
- stale/expired approval;
- changed digest;
- duplicate mutation;
- unknown outcome;
- unsupported version;
- slow WebSocket consumer;
- duplicate/out-of-order event;
- write while disabled;
- direct Hermes SQLite dependency;
- rooted/compromised device attempting high-risk action.

### Operational tests before remote read-only

- admin recovery and fresh-session privilege verification;
- credential rotation/revocation ledger;
- PM2/WebUI clean restart without secret repopulation;
- Cloudflare unauthorized/authorized/JWT/origin-bypass/real-IP tests;
- first-event latency and 10-minute stream survival;
- sidecar restart/rollback;
- push token rotation, receipts, provider outage, denied permission, invalid-token cleanup.

### Operational tests before write controls

- fixed SQLite runtime for every database-opening process;
- copied-database WAL/concurrency/integrity/restart tests;
- candidate promotion/rollback;
- active-work maintenance deferral;
- exact approval evidence/device signature/idempotency/reconciliation end to end.

---

## Acceptance Criteria

### Gate A — Safe code foundation

- consolidated commits pushed and reviewed;
- docs branch reconciled;
- mobile/sidecar/contracts independently build;
- exact API/OpenAPI contract reviewed;
- 96 reported sidecar tests reproduced;
- mock/read-only defaults;
- no production connection, secret, or VM mutation.

### Android read-only vertical slice

- Command Center replaces template home;
- mock protected navigation works;
- sessions/messages/jobs/alerts/diagnostics render;
- connection/reconnect/stale/offline states render;
- foreground reconciliation works;
- no mutation control;
- mobile/sidecar tests pass.

### Gate B — Remote read-only pilot

- admin recovery and privilege state proven;
- credentials rotated/revoked;
- durable secret loading proven;
- sidecar loopback-only under dedicated account;
- Access/Tunnel/JWT/real-IP/origin tests pass;
- trusted-device refresh/revocation pass;
- least-privilege DB reviewed;
- read-only Hermes/event relay works;
- no master key reaches phone/WebView;
- notifications and Samsung read-only lifecycle pass.

### Governed chat/run controls

- chat reuse/native boundary accepted;
- every enabled operation has explicit policy;
- Hermes remains source of truth;
- stop reconciles to terminal state;
- idempotency and unknown outcomes pass;
- unsupported version disables writes.

### Gate C — Approvals/job controls

- SQLite/update gates pass;
- exact approval schema captured;
- approve-once/deny only;
- evidence/digest/expiry/state/device signature pass;
- stale/duplicate/timeout/changed-state pass;
- manual job run biometric step-up;
- pause/resume confirmation;
- append-only audit complete.

### Final pilot

- signed APK installed on Samsung;
- complete security-negative/lifecycle matrix passes;
- redacted push opens authoritative state;
- lost/compromised device policy works;
- sidecar/Hermes/app rollback proven;
- docs/runbooks match deployment.

No later gate may be bypassed because an earlier demo appears functional.

---

## Out of Scope

- iOS/App Store;
- public Google Play production release;
- general remote terminal;
- sudo/root approval;
- infrastructure secret management;
- arbitrary service restart/config edit;
- direct Hermes SQLite inspection/mutation;
- second Hermes session/run/job/scheduler/memory/execution engine;
- session-wide/permanent command approval;
- autonomous infrastructure repair;
- multiple production Hermes instances in Release One;
- team invitations/organization administration;
- mandatory fully native chat before reuse evidence;
- voice;
- analytics copying conversation/tool content;
- EGA House product/deployment ownership.

---

## Further Notes

### Repository truth

GitHub `main` still shows the initial template. Local consolidated implementation remains operator-reported until issue #3 pushes and verifies it. PR #1 contains this specification and Wayfinder record and must be reconciled with the implementation branch.

### Hermes truth

Deployment validates exact installed `/v1/capabilities` and exact event payloads. Upstream `main` is reference material, not proof of installed behavior.

### Security posture

File permission cleanup and systemd hardening materially reduce risk but do not replace credential rotation, recovery proof, application authorization, secret-persistence verification, or endpoint negative testing.

### SQLite risk boundary

SQLite gate blocks production mobile write authority. It does not block mock UI or controlled read-only work. Remote read-only must not silently introduce new database writers.

### VM change freeze

During mobile/sidecar code stages, agents do not modify sudoers, users/groups, Docker, systemd, nginx, Cloudflare, SSH, firewall, Python/SQLite, Hermes config/venv, PM2, timers, databases, or production secrets. Production operations happen as separate manually reviewed tasks with backup, validation, and rollback.

---

## Primary References

### Planning

- [To-spec skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)
- [Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md)

### Repository baseline

- [package.json](../package.json)
- [app.json](../app.json)
- [root layout](../app/_layout.tsx)

### Hermes

- [API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Programmatic Integration](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md)
- [API implementation](https://github.com/NousResearch/hermes-agent/blob/main/gateway/platforms/api_server.py)
- [Desktop architecture](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/README.md)

### Expo and React Native

- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/)
- [Expo authentication](https://docs.expo.dev/guides/authentication/)
- [SecureStore SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/)
- [LocalAuthentication SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/local-authentication/)
- [Notifications SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/)
- [Internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [React Native WebSocket](https://reactnative.dev/docs/global-WebSocket)
- [React Native AppState](https://reactnative.dev/docs/appstate)

### Cloudflare, database, runtime, and device security

- [Cloudflare One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare original visitor IP](https://developers.cloudflare.com/support/troubleshooting/restoring-visitor-ips/restoring-original-visitor-ips/)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Fastify ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/)
- [SQLite WAL-reset bug](https://sqlite.org/wal.html#the_wal_reset_bug)
- [Android Play Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts)
- [Docker group security warning](https://docs.docker.com/engine/install/linux-postinstall/)
