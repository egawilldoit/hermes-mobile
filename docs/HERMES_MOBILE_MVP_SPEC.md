# Hermes Mobile MVP Specification

**Status:** Ready for ticketing; implementation remains gated by operational evidence  
**Version:** 1.0  
**Date:** 2026-07-26  
**Product:** Hermes Mobile  
**Primary platform:** Android private pilot  
**Companion document:** [Hermes Mobile Wayfinder Map](./HERMES_MOBILE_WAYFINDER.md)

This specification follows the structure and intent of Matt Pocock's [to-spec skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md): it synthesizes the decisions already made, describes behavior from the user's perspective, avoids inventing a second product architecture, and defines the highest practical test seams before implementation is expanded.

---

## Problem Statement

The operator runs Hermes Agent continuously on the `openclaw` VM. Hermes can already execute agent work, maintain sessions, stream tool progress, manage scheduled jobs, and request human approvals. Today, however, safely supervising that work from an Android phone requires switching between web interfaces, SSH, chat platforms, and infrastructure dashboards.

The existing remote surfaces do not provide one trusted mobile control plane with:

- a prioritized operational overview;
- durable mobile identity and device revocation;
- scoped authorization instead of the Hermes master API credential;
- reliable mobile reconnection and state reconciliation;
- urgent push notifications;
- full-screen evidence-based approvals;
- risk-based biometric step-up;
- an audit trail of mobile decisions;
- protection against stale, duplicated, or ambiguously completed mutations.

Directly embedding the Hermes API credential in an Android application is unacceptable because Hermes' API exposes an agent with terminal, file, web, memory, and skill capabilities. Exposing a generic proxy is also unacceptable because it would turn the phone into a remote shell. Reimplementing Hermes sessions, jobs, runs, or databases would create conflicting sources of truth.

The VM audit also identified operational risks that must remain visible in the product plan: credentials previously existed in unsafe locations, the Cloudflare mobile path is not yet activated, the sidecar is not yet deployed, the Hermes update pipeline is frozen pending compatibility controls, and the reported SQLite runtime must be upgraded and validated before production mobile write actions are enabled.

The user needs a secure Android application that makes Hermes observable and governable without turning the phone, sidecar, or Supabase database into a second Hermes runtime or a new root-administration surface.

---

## Solution

Build Hermes Mobile as a native Android control plane around the existing Hermes Agent installation.

The solution has four cooperating boundaries:

1. **Hermes Agent** remains authoritative for sessions, messages, runs, jobs, approvals, models, skills, memory, and execution.
2. **Hermes Mobile sidecar** protects Hermes credentials, authenticates trusted devices, exposes explicit mobile operations, relays events, generates alerts, and records mobile-owned audit data.
3. **Hermes Mobile Android application** provides the Command Center, session browsing/chat, job views and controls, alerts, approvals, diagnostics, and secure device-session handling.
4. **Cloudflare Access and Tunnel** provide approved-email enrollment and an outbound-only path from the public edge to the loopback sidecar.

The final MVP is a **Governed Operator** experience:

- one operator and one Hermes production installation in Release One;
- multi-user-safe identifiers and data design from the start;
- native operational and sensitive screens;
- initial chat reuse where it reduces risk and duplication;
- read-only delivery first;
- governed chat/run controls second;
- approval and scheduled-job mutations only after all security and evidence gates pass.

The product fails closed. Unknown Hermes capabilities are unavailable. The application never retries an uncertain mutation blindly. A stale approval cannot execute. Push notifications are advisory; authoritative state is refreshed in the application.

---

## Goals and Success Measures

### Product goals

1. Give the operator a single Android Command Center for the most important Hermes state.
2. Allow the operator to inspect and govern Hermes without SSH for ordinary operational actions.
3. Protect the Hermes master credential and all infrastructure secrets from the mobile device.
4. Preserve Hermes as the only execution and workflow authority.
5. Deliver urgent notifications without exposing sensitive content on the lock screen.
6. Make every high-risk mobile action explicit, current, idempotent, and auditable.
7. Survive normal mobile lifecycle events and network transitions without losing truth.
8. Establish a structure that can support additional users and Hermes installations later without redesigning all records.

### MVP success measures

The MVP is successful when:

- the signed Android APK installs and operates on the operator's Samsung device;
- the Command Center loads current Hermes and sidecar state through Cloudflare Tunnel;
- no Hermes API key, Supabase service-role key, Cloudflare service credential, provider key, or infrastructure secret is present in the APK or mobile logs;
- a revoked device cannot refresh or access the sidecar;
- foreground state refresh completes after app resume and network switching;
- an interrupted stream reconnects and reconciles without duplicating lifecycle events;
- urgent alerts appear in the in-app alert inbox and may generate redacted push notifications;
- approve-once and deny decisions are bound to the exact current operation and recorded in append-only audit history;
- duplicate taps do not duplicate an operation;
- an unknown mutation outcome is visibly reconciled before another attempt;
- sidecar, Hermes, and update rollback procedures are tested;
- all release-gate security, lifecycle, and compatibility tests pass.

### Performance targets

These are initial MVP targets and should be measured on the real Samsung device and VM path:

- cached Command Center shell visible within 1 second after app unlock;
- fresh health/alert summary available within 3 seconds on a healthy network;
- foreground event relay adds less than 250 milliseconds median overhead beyond the upstream Hermes event arrival at the sidecar;
- visible reconnect state within 1 second after stream loss;
- automatic reconnect attempts begin within 250 milliseconds and back off with jitter;
- high-risk mutation API calls use bounded timeouts and return a correlation identifier;
- no unbounded in-memory event queue or transcript cache.

---

## Actors

### Operator

The initially approved human user. The operator can enroll a trusted Android device, observe Hermes, and perform explicitly permitted governed actions.

### Trusted Device

A registered Android installation with a server-known device identity, protected refresh credentials, push registrations, and revocation state.

### Hermes Mobile Application

The native Android client. It renders state and collects decisions but is never an authority for Hermes run/job/session truth.

### Hermes Mobile Sidecar

The server-side policy and integration boundary. It validates identity, enforces authorization, adapts Hermes interfaces, relays events, and records mobile-owned evidence.

### Hermes Agent

The authoritative agent runtime on the VM.

### Cloudflare Access

The enrollment identity gate. It proves that the approved email completed authentication and supplies a signed application JWT to the origin.

### Mobile-Control Database

The durable store for device, token, alert, notification, idempotency, compatibility, and audit records. It does not duplicate Hermes sessions, runs, messages, or jobs.

---

## User Stories

1. As the operator, I want to open one Android application and immediately understand whether Hermes needs my attention, so that I do not have to inspect multiple tools.
2. As the operator, I want pending approvals shown before routine activity, so that blocked agent work is resolved quickly.
3. As the operator, I want failed and blocked runs prioritized above healthy runs, so that operational problems are visible first.
4. As the operator, I want to see active runs and their current stage, so that I understand what Hermes is doing now.
5. As the operator, I want Hermes liveness and detailed readiness represented separately, so that an online process is not mistaken for a healthy system.
6. As the operator, I want critical VM health summarized without remote shell access, so that disk, database, and service risks are visible safely.
7. As the operator, I want to browse recent Hermes sessions, so that I can resume relevant work from my phone.
8. As the operator, I want to read a session's message history, so that I can understand context before acting.
9. As the operator, I want to search and filter sessions, so that a large session history remains usable.
10. As the operator, I want to fork a session when supported and permitted, so that I can explore an alternative without corrupting the original thread.
11. As the operator, I want to send a governed chat prompt, so that I can continue normal Hermes interaction remotely.
12. As the operator, I want chat and tool progress to stream, so that long operations do not appear frozen.
13. As the operator, I want to start a normal governed run, so that I can initiate approved work without SSH.
14. As the operator, I want to stop a run after explicit confirmation, so that runaway or incorrect work can be interrupted.
15. As the operator, I want stop requests to show a `stopping` state until Hermes actually exits, so that I do not assume execution ended immediately.
16. As the operator, I want scheduled jobs listed with schedule, next run, last run, and outcome, so that I can understand automation health.
17. As the operator, I want to pause or resume a scheduled job after confirmation, so that I can govern recurring work safely.
18. As the operator, I want a biometric step-up before manually running a scheduled job, so that accidental or unauthorized execution is reduced.
19. As the operator, I want urgent failures to create an alert, so that I do not have to keep the application open.
20. As the operator, I want approval-required events to create a high-priority alert, so that blocked work is surfaced promptly.
21. As the operator, I want lock-screen notifications to hide commands, prompts, paths, and tool arguments, so that sensitive work is not disclosed.
22. As the operator, I want tapping a notification to open the current authoritative alert screen, so that stale push content cannot drive a decision.
23. As the operator, I want routine successes available in the app without interrupting me, so that notifications remain meaningful.
24. As the operator, I want an alert to show whether it is open, acknowledged, or resolved, so that repeated failures are not confused with new incidents.
25. As the operator, I want repeated instances of the same unresolved failure deduplicated, so that alert noise does not hide new incidents.
26. As the operator, I want to enroll using my approved email through Cloudflare Access, so that no separate public password database is required for the pilot.
27. As the operator, I want enrollment to happen once per trusted device, so that I do not need email verification on every app launch.
28. As the operator, I want the application to use short-lived access tokens and rotating refresh tokens, so that a captured token has limited value.
29. As the operator, I want to revoke a lost device from the server, so that it cannot regain access.
30. As the operator, I want refresh-token reuse to revoke the affected token family, so that stolen credentials fail closed.
31. As the operator, I want tokens and device secrets stored in Android's secure storage, so that they are not placed in normal application storage.
32. As the operator, I want an approval screen to show the exact tool, command, arguments, working directory, resources, risk, and expiry, so that I understand what I am approving.
33. As the operator, I want high-risk approval to require biometrics, so that possession of an unlocked app session is not enough.
34. As the operator, I want approval to be bound to the exact operation digest and current run state, so that a changed command cannot reuse my decision.
35. As the operator, I want only approve-once and deny available in the initial MVP, so that mobile approval does not create permanent command policy.
36. As the operator, I want an expired or changed approval marked stale, so that I cannot approve an obsolete operation.
37. As the operator, I want duplicate taps to return the original idempotent result, so that one action is not executed twice.
38. As the operator, I want a timed-out mutation reconciled before retry, so that an unknown successful action is not duplicated.
39. As the operator, I want every sensitive mobile decision recorded with device, principal, operation digest, and outcome, so that I can audit what happened.
40. As the operator, I want the app to show when data is stale or cached, so that offline information is not mistaken for live truth.
41. As the operator, I want the application to refresh authoritative state when it returns to the foreground, so that Android suspension does not leave controls stale.
42. As the operator, I want network switching and reconnect state represented clearly, so that temporary mobile loss does not look like Hermes failure.
43. As the operator, I want missed and duplicate events reconciled, so that the Command Center remains correct after disconnection.
44. As the operator, I want the app to disable mutations when its version or the Hermes version is unsupported, so that compatibility uncertainty fails closed.
45. As the operator, I want diagnostics to show app version, environment, sidecar state, Hermes instance, last refresh, and a correlation ID, so that failures can be investigated without exposing secrets.
46. As the operator, I want to copy a sanitized diagnostic summary, so that I can share evidence with an agent or developer safely.
47. As the operator, I want the private APK signed with a controlled key and installable on my Samsung device, so that I can pilot without a public store release.
48. As the operator, I want notification channels separated by approvals, failures, critical system events, and routine activity, so that Android notification settings match event importance.
49. As a future additional operator, I want records scoped by principal and device, so that Release One does not prevent safe multi-user support.
50. As a future administrator, I want multiple Hermes installations represented explicitly, so that Release One's single instance does not become a permanent singleton assumption.
51. As a security reviewer, I want unknown sidecar routes and Hermes capabilities denied by default, so that upstream additions do not silently expand mobile authority.
52. As a security reviewer, I want to prove the mobile APK contains no master or service credentials, so that client compromise does not expose the VM.
53. As a security reviewer, I want the sidecar to run without sudo, Docker, SSH keys, or Hermes SQLite access, so that compromise has a bounded blast radius.
54. As an operator maintaining Hermes, I want updates tested in an isolated candidate before promotion, so that a daily update cannot silently break the mobile contract.
55. As an operator maintaining Hermes, I want active runs and pending approvals to defer maintenance, so that updates do not kill governed work.
56. As an operator maintaining Hermes, I want rollback tested before promotion, so that an incompatible Hermes release can be reversed quickly.
57. As an operator, I want production write controls disabled until the SQLite runtime and database integrity gates pass, so that mobile convenience does not amplify a known persistence risk.
58. As a developer, I want the mobile app and sidecar to share portable contracts without sharing platform-specific implementation, so that types remain consistent without bundling server code into Android.
59. As a developer, I want mock mode to support the full mobile information architecture, so that UI work can proceed without production access.
60. As a developer, I want the highest-level sidecar contract and Android vertical slice tested, so that the product is verified through behavior rather than private implementation details.

---

## MVP Scope and Delivery Stages

The MVP is one governed product delivered through staged capability gates. A stage may ship to the private pilot only when its own acceptance criteria pass.

### Stage 0 — Repository and contract foundation

Included:

- canonical Hermes Mobile repository;
- existing Expo application preserved;
- sidecar module;
- portable shared contracts;
- mock Hermes implementation;
- safe defaults with production integration and write actions disabled;
- unit, contract, and security-negative tests.

Exit condition: repository state and tests are pushed and reproducible.

### Stage 1 — Android read-only vertical slice

Included:

- mock trusted session shell;
- native Command Center;
- Hermes/sidecar health;
- sessions and message history;
- jobs and job detail;
- alerts and diagnostics;
- loading, empty, error, offline, and stale states;
- mobile event state and foreground reconciliation;
- no production connectivity and no write action.

Exit condition: UI works in a development build or simulator and passes tests without production access.

### Stage 2 — Remote read-only pilot

Included:

- credential rotation complete;
- sidecar deployed under dedicated identity;
- Cloudflare Access enrollment and Tunnel;
- trusted-device tokens and revocation;
- mobile-owned database;
- read-only Hermes adapters;
- authenticated event relay;
- redacted urgent alerts and push-token registration;
- real Samsung connectivity tests.

Exit condition: operator can securely observe production Hermes from the Samsung device with no mobile mutation path.

### Stage 3 — Governed chat and run controls

Included:

- session creation/resume/fork as permitted;
- chat streaming;
- normal run creation;
- run status and event streaming;
- stop/cancel after confirmation;
- ownership mapping and idempotency;
- unsupported-version read-only fallback.

Exit condition: all actions are scoped, current, idempotent, and reconciled after network loss.

### Stage 4 — Governed approvals and scheduled-job controls

Included:

- exact approval evidence;
- approve once and deny;
- biometric-backed device signature;
- stale, expiry, duplicate, and unknown-outcome behavior;
- manual job run with biometric step-up;
- pause/resume with confirmation;
- append-only audit evidence;
- SQLite and update-pipeline gates complete.

Exit condition: the full Governed Operator MVP passes the end-to-end security and lifecycle matrix.

---

## Information Architecture and Interaction Decisions

### Main navigation

The application provides five primary destinations:

- Command;
- Sessions;
- Jobs;
- Alerts;
- Settings.

A dedicated full-screen Approval route is opened from Command, Alerts, or a push deep link. It is not reduced to a bottom-sheet confirmation.

### Command Center ordering

The home experience is ordered by operational importance:

1. pending approvals;
2. failed or blocked runs;
3. active runs;
4. Hermes and VM health;
5. recent sessions;
6. scheduled jobs;
7. quick chat entry.

When a capability is not yet enabled, the UI must omit the action or show a clear gated state; it must not render a control that silently fails.

### State presentation

All server-backed screens support:

- loading;
- empty;
- current;
- stale/cached;
- offline;
- degraded dependency;
- unauthorized/revoked;
- unsupported version;
- sanitized error with correlation ID.

A process being online is shown separately from detailed readiness.

### Approval presentation

The approval screen always refreshes the current request before enabling a decision. It presents normalized evidence and a visible expiry. The action button remains disabled when evidence is incomplete, expired, stale, or unsupported.

### Notifications

Notification taps navigate using opaque identifiers. The target screen fetches authoritative data. No approval decision is available directly from the Android lock screen.

---

## Implementation Decisions

### 1. Repository and module boundaries

The canonical product repository contains three principal modules:

- **Mobile application:** Expo Router, React Native, NativeWind, and React Native Reusables.
- **Mobile sidecar:** Node.js, TypeScript, Fastify, runtime schemas, authentication, authorization, rate limits, event relay, notifications, and data adapters.
- **Shared contracts:** portable request, response, event, and error schemas that can be consumed by both mobile and server environments.

Shared contracts must not depend on Node filesystem APIs, Fastify, database drivers, Expo, or React Native.

The currently visible GitHub baseline uses Expo `56.0.13`, React Native `0.85.3`, React `19.2.3`, and Expo Router `56.2.12`. The MVP should preserve this working baseline unless a separate upgrade decision is accepted and tested.

### 2. Hermes remains authoritative

The sidecar never stores a second canonical copy of Hermes sessions, messages, runs, or jobs. It stores identifiers, watch state, alert lifecycle, digests, and audit evidence only.

All Hermes data is obtained through supported Hermes interfaces. Direct SQLite access is prohibited.

### 3. Explicit sidecar API

The sidecar exposes a finite mobile API, not a path-forwarding proxy.

Representative read operations:

- `GET /health`
- `GET /ready`
- `GET /v1/hermes/status`
- `GET /v1/hermes/capabilities`
- `GET /v1/hermes/models`
- `GET /v1/hermes/skills`
- `GET /v1/hermes/toolsets`
- `GET /v1/sessions`
- `GET /v1/sessions/{sessionId}`
- `GET /v1/sessions/{sessionId}/messages`
- `GET /v1/jobs`
- `GET /v1/jobs/{jobId}`
- `GET /v1/mobile/alerts`

Representative device/authentication operations:

- enrollment start and callback;
- one-time code exchange;
- token refresh;
- device registration/list/revocation;
- push-token registration and rotation.

Representative governed operations, disabled until their release gates pass:

- session create/chat/fork;
- run create/stop;
- approval resolve;
- job run/pause/resume.

No endpoint accepts an arbitrary upstream URL, arbitrary Hermes path, or shell command.

### 4. Hermes compatibility discovery

The sidecar queries Hermes health, detailed readiness, and capabilities on startup and periodically. It records the observed Hermes version and required feature flags.

Mutations require a compatible capability snapshot. If the version or feature set is unsupported:

- reads that remain safe may continue;
- all affected mutations are disabled;
- the mobile app displays an unsupported-version state;
- the event is audited and may create an operational alert.

### 5. Network architecture

Production ingress uses Cloudflare Tunnel to the loopback-only sidecar. Hermes API and WebUI remain loopback services behind controlled ingress.

Enrollment routes are protected by Cloudflare Access. The sidecar validates `Cf-Access-Jwt-Assertion` with the Cloudflare JWKS, expected issuer, and application audience.

Normal mobile API calls use sidecar-issued device tokens. Cloudflare remains an edge and transport protection layer; it does not replace application authorization.

Caching is disabled for authentication, API, alert, and stream responses. Streaming routes disable proxy buffering and use appropriate long-lived timeouts.

### 6. Enrollment and device authentication

Enrollment uses Authorization Code plus PKCE semantics:

1. The Android app creates a verifier, challenge, state, device identifier, and device key pair.
2. The system browser opens the Cloudflare-protected enrollment route.
3. Cloudflare authenticates the approved email.
4. The sidecar validates the Access JWT and creates a short-lived one-time authorization code bound to the PKCE challenge and device request.
5. A verified app link returns the code and state to the Android app.
6. The app exchanges the code and verifier.
7. The sidecar registers the device and issues a short-lived access token and rotating refresh token.

The app does not place access or refresh tokens in deep-link parameters.

### 7. Token policy

Defaults:

- access token lifetime: 10 minutes;
- refresh token lifetime: 30 days;
- refresh tokens rotate on every successful use;
- server stores refresh-token hashes, not raw tokens;
- reuse of an old refresh token revokes the token family;
- device revocation invalidates refresh access and push registrations;
- access token remains memory-resident where possible;
- refresh token and device private key use Expo SecureStore.

The sidecar attaches principal, device, Hermes instance, scopes, and correlation identity to every authenticated request.

### 8. Authorization model

Authorization is explicit and deny-by-default.

A permission matrix maps each mobile operation to:

- required scope;
- permitted release stage;
- confirmation requirement;
- biometric step-up requirement;
- idempotency requirement;
- audit requirement;
- compatibility requirement.

The operator's Release One role does not bypass route policy. Future roles may narrow or expand explicitly classified capabilities.

### 9. Rate limiting and abuse controls

Limits exist at multiple dimensions:

- edge/IP;
- principal;
- device;
- route/operation;
- token refresh;
- approval attempt;
- run creation;
- concurrent WebSocket connections and subscriptions.

Authenticated application limits do not depend solely on source IP. Rate-limit errors return a stable error code and retry metadata without leaking security policy internals.

### 10. Upstream Hermes transport

The sidecar uses Hermes HTTP and SSE interfaces documented by Hermes:

- REST for current state and bounded mutations;
- SSE for chat/run lifecycle streams;
- polling as reconciliation fallback;
- capability discovery before exposing optional behavior.

The Hermes master bearer token is injected server-side and never returned, logged, or accepted from the mobile client.

### 11. Mobile event relay

The sidecar may normalize upstream lifecycle streams into one authenticated WebSocket endpoint for Android.

The event envelope contains:

- event ID;
- monotonic sequence within the relay scope;
- event type;
- Hermes instance identity;
- entity type and identity;
- occurred timestamp;
- authoritative state version where available;
- redacted payload.

The relay supports:

- heartbeat;
- bounded replay;
- `lastEventId` reconnect;
- duplicate suppression;
- bounded per-client queue;
- backpressure;
- slow-client disconnect;
- authorization per subscription;
- current-state reconciliation after replay gaps.

Token deltas are not written to the mobile-control database.

### 12. Android lifecycle behavior

When the app moves to the background:

- foreground streams may remain briefly during a grace period;
- the app does not assume Android will keep a permanent connection alive;
- the sidecar remains responsible for run observation and urgent alerts.

When the app returns to active state:

- tokens are refreshed if needed;
- event connection is re-established;
- health, alerts, active runs, jobs, and visible session state are reconciled;
- controls stay disabled until required current state is available.

### 13. Mobile-owned data model

The mobile-control database includes the following logical entities:

- principals;
- devices;
- refresh-token families;
- device public keys;
- Hermes instances;
- watched runs;
- approvals and evidence;
- alerts;
- push tokens;
- notification preferences;
- notification deliveries;
- idempotency records;
- audit events;
- health snapshots.

Every relevant row includes principal and Hermes-instance identity; device identity is included where applicable.

No transcript, full raw tool output, provider secret, or full Hermes job database is copied into this store.

### 14. Row-level security and database access

Operational tables should reside in a non-public schema. The mobile app does not connect directly with a service-role credential. The sidecar uses a dedicated database role with only the grants it needs.

RLS is enabled as defense in depth. Append-only audit records cannot be updated or deleted by the normal sidecar role.

### 15. Audit integrity

Each sensitive operation creates an append-only audit event containing:

- principal and device;
- Hermes instance;
- request and correlation IDs;
- operation class;
- canonical operation digest;
- idempotency key;
- decision and final outcome;
- timestamps;
- previous-event hash and event hash where hash chaining is enabled.

Audit entries contain normalized/redacted evidence, not secret values.

### 16. Idempotency and mutation reconciliation

Every mobile mutation carries an idempotency key.

The sidecar records a durable operation state such as:

- claimed;
- forwarded;
- completed;
- failed;
- outcome unknown;
- reconciled.

A duplicate request with the same key and equivalent payload receives the original result. A key reused with a different payload is rejected.

When the upstream response is lost after forwarding, the sidecar queries current Hermes state before deciding whether a retry is safe.

### 17. Approval policy

The initial mobile approval choices are:

- approve once;
- deny.

Session-wide and permanent approval choices are not exposed in the MVP.

The sidecar normalizes and stores evidence required for review. A decision is accepted only when:

- approval is still pending;
- it has not expired;
- the operation digest matches;
- required run/session state has not changed;
- the device is active;
- biometric-backed device challenge verification succeeds for approval;
- the idempotency key is valid.

Approval configuration should use a manual mode and a timeout appropriate for mobile review after safe testing. The current audit-reported `smart` mode and 60-second timeout are not accepted as the final governed-mobile policy.

### 18. Biometric-backed proof

The app uses Expo LocalAuthentication to prompt Android biometrics for classified high-risk actions.

The server does not trust a client boolean stating that biometrics succeeded. Instead, the device private key is protected by secure device authentication and signs a server nonce containing the operation identity and digest. The sidecar verifies the signature and device state.

### 19. Notification model

Expo Push Service is the initial delivery provider, backed by Android FCM credentials. The sidecar stores Expo and native device tokens when available to preserve future provider flexibility.

Notification channels:

- approvals;
- failures;
- system-critical;
- routine activity.

Push body is generic and redacted. The payload contains opaque routing identifiers only.

Token changes update registration. Invalid/uninstalled-device receipts disable stale tokens. Provider failure does not delete the authoritative alert.

### 20. Alert lifecycle

An alert has a stable deduplication key based on event class, Hermes instance, entity, and authoritative state version.

Lifecycle:

- open;
- provider accepted/rejected;
- opened;
- acknowledged;
- resolved.

Repeated identical failures update occurrence metadata and follow suppression policy rather than creating unlimited pushes.

### 21. Native and reused chat boundary

The MVP uses native screens for sensitive controls and operational state.

The existing Hermes WebUI may be embedded or adapted for initial chat after a security proof covering:

- allowed origins;
- authentication handoff;
- no Hermes master token in WebView JavaScript;
- navigation escape prevention;
- session and stream behavior;
- Android keyboard, back, and lifecycle behavior.

A fully native chat rewrite is deferred until pilot evidence demonstrates that reuse is insufficient.

### 22. Android build and distribution

The first pilot uses a signed internal-distribution APK installed directly on the Samsung device.

The target Android application identifier is `online.egawilldoit.hermes`, subject to collision validation before configuration.

Build profiles separate development, preview, and production. Preview is used for the private pilot. Signing credentials are backed up securely under operator control.

Remote push notifications require an Android development or standalone build; they are not accepted as validated through Expo Go alone.

### 23. Application updates

Over-the-air application updates remain disabled for the first privileged pilot unless code-signing, runtime-version compatibility, rollback, and forced-minimum-version behavior are explicitly validated.

The sidecar publishes a minimum supported app version. An outdated app enters read-only mode or blocks access according to the compatibility policy.

### 24. Hermes update compatibility

The automatic production Hermes update timer remains disabled until a gated promotion process exists.

The promotion model is:

- candidate;
- validated;
- current;
- previous.

Promotion requires no active runs, no pending approvals, isolated candidate testing, capability/contract tests, sidecar and WebUI compatibility tests, and proven rollback.

### 25. SQLite operational gate

Production mobile write actions remain disabled until every process that opens Hermes databases uses a SQLite release containing the WAL-reset correction and passes integrity, concurrency, restart, backup, and rollback verification.

This gate does not block mock work or a remote read-only pilot that does not increase database mutation authority.

### 26. Feature flags

At minimum, configuration includes flags equivalent to:

- Hermes integration mode;
- mobile write actions enabled;
- push delivery enabled;
- database mode;
- chat reuse enabled;
- approval controls enabled;
- scheduled-job controls enabled;
- required Hermes capability/version policy.

Production startup fails when required secure configuration is absent. Development defaults remain mock and read-only.

### 27. Error contract

The sidecar returns stable, sanitized error codes including:

- authentication required or expired;
- device revoked or untrusted;
- permission denied;
- step-up required;
- Hermes offline or degraded;
- unsupported Hermes capability/version;
- run/session/job not found;
- state changed;
- approval expired or stale;
- action outcome unknown;
- stream disconnected or reconciling;
- push unavailable;
- database unavailable;
- update required.

Every operational error includes a correlation ID. Raw provider, command, tool, or secret-bearing errors are not returned to Android.

---

## Non-Functional Requirements

### Security

- No master/service/infrastructure credential in the APK.
- No generic proxy, arbitrary URL, shell, or command endpoint.
- Sidecar runs as a dedicated unprivileged identity with no sudo or Docker access.
- Unknown capabilities denied by default.
- Sensitive tokens stored in SecureStore.
- Cloudflare Access JWT validated at origin.
- High-risk decisions require current evidence and device-bound proof.
- Logs and diagnostics redact secrets and sensitive payloads.
- Mobile-owned database uses least privilege and RLS defense in depth.

### Reliability

- Server observation continues when the phone is closed.
- Reconnect is idempotent and state-reconciling.
- Push is advisory; alert database is authoritative.
- Mutations are idempotent and unknown outcomes are reconciled.
- Service and compatibility failures degrade to read-only where safe.

### Performance

- Streaming data is forwarded promptly and not persisted per token.
- Lists are paginated.
- Event history and queues are bounded.
- Expensive catalog refreshes are rate limited and cached safely.
- Health snapshots use short retention.

### Privacy

- Lock-screen notifications contain no command, prompt, path, repository, or tool-argument detail.
- Audit and analytics contain normalized metadata rather than full transcripts.
- No advertiser or third-party application receives conversation content through the mobile architecture.

### Accessibility

- Android touch targets meet platform minimums.
- Interactive elements have accessible names and states.
- Severity is not communicated by color alone.
- Loading and connection states are announced appropriately.
- Biometric failure provides a safe cancel path, not an insecure bypass.

### Maintainability

- Shared contracts remain portable.
- Hermes adapters are explicit and capability-aware.
- Tests assert external behavior.
- Product decisions live in durable documentation.
- Feature flags keep incomplete privileged capabilities disabled.

---

## Testing Decisions

### Testing philosophy

Tests verify externally observable behavior and policy boundaries rather than private implementation details. Existing seams are preferred. The ideal high-level seam is the **mobile-facing sidecar contract**, exercised against a deterministic mock Hermes service and the mobile application.

A second required seam is a bounded **real Hermes integration suite** that runs against an isolated compatible Hermes candidate or controlled production read-only surface. Real integration tests must not use destructive production state.

### Primary seams

#### Seam 1 — Mobile API contract

Exercise the sidecar as an HTTP/WebSocket service with test identity, test database, and mock Hermes upstream.

This seam validates:

- runtime schemas;
- authentication and refresh rotation;
- device revocation;
- authorization and route allowlists;
- rate limiting;
- errors and redaction;
- event normalization, replay, deduplication, and backpressure;
- alert and notification lifecycle;
- idempotency and audit records;
- write-action feature gates.

#### Seam 2 — Android vertical slice

Render the real application navigation and screens against a deterministic sidecar/mock contract.

This seam validates:

- protected routes;
- Command Center priority;
- sessions/jobs/alerts/diagnostics;
- loading, empty, stale, offline, and error states;
- foreground refresh;
- connection/reconnect state;
- absence of unauthorized controls;
- sanitized diagnostics.

#### Seam 3 — Hermes compatibility contract

Run read-only and safe disposable-workspace probes against the exact supported Hermes version/candidate.

This seam validates:

- health and detailed readiness;
- required capability flags;
- session and job read operations;
- run creation/event/stop only in an isolated safe environment;
- approval event shape in a controlled non-destructive scenario;
- timeout, restart, and unsupported-version behavior.

#### Seam 4 — Real Android pilot lifecycle

Use the signed preview APK on the actual Samsung device.

This seam validates:

- installation and signing;
- secure enrollment and token persistence;
- app links;
- biometrics;
- push channels and token rotation;
- Wi-Fi/mobile switching;
- background, termination, reboot, and battery optimization;
- sidecar/Hermes restart;
- revoked device and minimum-version behavior.

### Module test decisions

#### Mobile application

Test:

- session provider and protected navigation;
- API client and shared contracts;
- Command Center composition;
- sessions, jobs, alerts, approvals, and diagnostics behavior;
- event provider and AppState reconciliation;
- token/secret storage adapters;
- notification navigation and redaction;
- high-risk action gating.

Do not test styling implementation details or private hook internals when screen-level behavior can prove the same requirement.

#### Sidecar

Test:

- Cloudflare JWT verifier;
- PKCE authorization-code exchange;
- token rotation and reuse theft detection;
- device revocation;
- permission matrix;
- per-dimension rate limiting;
- Hermes explicit adapters;
- compatibility policy;
- event relay;
- push provider and receipt processing;
- idempotency and reconciliation;
- approval binding;
- audit append-only behavior;
- error redaction and correlation IDs.

#### Shared contracts

Test:

- valid payload acceptance;
- invalid payload rejection;
- compatibility across mobile and sidecar builds;
- no platform-specific dependency leakage.

### Security-negative tests

Required negative tests include:

- missing/invalid/expired access token;
- revoked device;
- old refresh-token reuse;
- mismatched PKCE verifier or state;
- forged or wrong-audience Cloudflare JWT;
- unknown route;
- arbitrary Hermes path or upstream URL;
- oversized payload;
- header injection;
- path traversal;
- log secret leakage;
- Hermes master-key exposure;
- subscription to an unauthorized entity;
- stale or expired approval;
- changed operation digest;
- duplicate mutation tap;
- unknown mutation outcome;
- unsupported Hermes version;
- slow WebSocket consumer;
- event duplication and out-of-order delivery;
- write action while feature flag is disabled;
- direct Hermes SQLite dependency.

### Operational tests

Before remote pilot:

- credential-rotation verification;
- origin-bypass test;
- Cloudflare Access unauthorized and authorized flows;
- stream first-event latency and ten-minute survival;
- sidecar restart and rollback;
- disk/readiness alert generation;
- push provider outage;
- invalid push-token cleanup.

Before write controls:

- fixed SQLite runtime verification for every database-opening process;
- copied-database concurrency and WAL tests;
- Hermes candidate promotion and rollback;
- active-run and pending-approval maintenance deferral;
- approval evidence and device-signature end-to-end test.

---

## Acceptance Criteria

### Repository foundation

- The consolidated sidecar/contracts branch is pushed and reviewable.
- Mobile, sidecar, and shared contracts build independently.
- Mock mode is the default.
- Production integration, push delivery, and write actions default to disabled.
- No production secret exists in the repository.
- Existing sidecar tests remain passing.

### Android read-only vertical slice

- The template home is replaced by the Command Center.
- Protected navigation and mock sign-in/sign-out work.
- Sessions, session messages, jobs, alerts, and diagnostics render.
- Event connection, reconnect, stale, and offline states render.
- App foregrounding triggers reconciliation.
- No mutation control is available.
- Mobile typecheck, lint, and tests pass.

### Remote read-only pilot

- Credential rotation is complete.
- Sidecar runs loopback-only under the dedicated account.
- Cloudflare Access and Tunnel tests pass.
- Trusted-device enrollment, refresh, and revocation pass.
- Mobile database and RLS/grants are reviewed.
- Read-only adapters and event relay work against production Hermes.
- No master credential reaches the phone.
- Samsung network/lifecycle tests pass.

### Governed chat/run controls

- Explicit permissions exist for every enabled operation.
- Session/chat/run state is fetched from Hermes.
- Stop behavior reconciles until terminal state.
- Idempotency prevents duplicate execution.
- Unsupported versions disable mutations.
- Network-loss unknown outcomes reconcile before retry.

### Approval/job controls

- SQLite runtime and update-pipeline gates pass.
- Exact approval event schema is captured and supported.
- Approve-once and deny only are available.
- Approval digest, expiry, state binding, biometrics, and device signature pass.
- Stale, duplicate, timeout, and changed-state tests pass.
- Job run uses biometric step-up.
- Pause/resume uses confirmation.
- Audit evidence is append-only and complete.

### Final MVP pilot

- Signed APK installed on the Samsung device.
- All security-negative and lifecycle tests pass.
- Push notifications are redacted and actionable only through authoritative in-app state.
- Lost-device revocation works.
- Sidecar and Hermes rollback procedures are tested.
- Documentation and runbooks match deployed behavior.

---

## Release Gates

### Gate A — Safe code foundation

Required:

- contracts, tests, mocks, and feature flags;
- no production connection or VM mutation;
- no secrets;
- local branch pushed and reviewed.

### Gate B — Remote read-only Android pilot

Required:

- credential rotation;
- tested admin recovery and service stability;
- sidecar deployment and read-only adapters;
- Cloudflare Access/Tunnel validation;
- trusted-device auth and revocation;
- database least privilege;
- Samsung lifecycle test.

### Gate C — Governed write actions

Required:

- fixed SQLite runtime and integrity validation;
- safe Hermes update promotion/rollback;
- ownership and authority matrix implemented;
- idempotency and unknown-outcome reconciliation;
- exact approval-schema proof;
- biometric-backed operation binding;
- full audit and negative tests.

No later gate may be bypassed because an earlier-stage demo appears functional.

---

## Out of Scope

The following are outside this MVP:

- iOS application and App Store release;
- public Google Play production distribution;
- general-purpose remote terminal;
- sudo/root approval;
- infrastructure secret management;
- arbitrary VM service restart or configuration editing;
- direct Hermes SQLite inspection or mutation;
- a second session, run, job, scheduler, memory, or execution engine;
- permanent or session-wide command approval from mobile;
- autonomous infrastructure remediation;
- multiple production Hermes installations in Release One;
- team invitations and organization administration;
- complete native rewrite of the Hermes chat renderer before pilot evidence;
- voice interaction;
- broad analytics that copy conversation or tool content;
- EGA House Platform features or deployment ownership.

---

## Further Notes

### Current repository truth

GitHub `main` currently exposes the initial Expo template only. The user reported a VM-local consolidated branch with the sidecar, shared contracts, mock API client, documentation, and 96 passing tests. Pushing and verifying that branch is the first repository gate.

### Current Hermes truth

The VM audit reported Hermes `0.19.0` at commit `92549c9a6e6e7c03a9cb945a2c4e75179a0e2d7d`, with the API server on loopback port `8642`. Deployment must validate the exact running `/v1/capabilities` rather than assuming current upstream `main` behavior.

### Security posture

The remediation materially reduced privilege and secret-file exposure, but remote pilot readiness still requires rotation of previously exposed credentials and validation that secrets are not reintroduced through process persistence, backups, logs, or deployment scripts.

### Read-only versus write risk

The SQLite WAL-reset issue is treated as a blocker for production mobile write controls, not as a reason to stop Android UI development or the controlled remote read-only pilot. This distinction keeps product progress moving without hiding persistence risk.

### Source provenance

Product and architecture decisions come from the Hermes Mobile planning conversation and the operator-provided VM audit/remediation summaries. Repository-version facts come from the checked-in package manifest and Expo configuration. External behavior and security guidance come from the official sources listed below.

---

## Primary References

### Planning method

- [To-spec skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)
- [Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md)

### Repository baseline

- [Package manifest](../package.json)
- [Expo configuration](../app.json)
- [Root layout](../app/_layout.tsx)

### Hermes Agent

- [Hermes API Server documentation](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Hermes Programmatic Integration](https://github.com/nousresearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md)
- [Hermes API server implementation](https://github.com/NousResearch/hermes-agent/blob/main/gateway/platforms/api_server.py)

### Expo and React Native

- [Expo Router authentication and protected routes](https://docs.expo.dev/router/advanced/authentication/)
- [Expo authentication guide](https://docs.expo.dev/guides/authentication/)
- [Expo SecureStore and device storage guidance](https://docs.expo.dev/develop/user-interface/store-data/)
- [Expo LocalAuthentication](https://docs.expo.dev/versions/v54.0.0/sdk/local-authentication/)
- [Expo Notifications for SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/)
- [Expo push notifications overview](https://docs.expo.dev/push-notifications/overview/)
- [Expo Internal Distribution](https://docs.expo.dev/build/internal-distribution/)
- [React Native AppState](https://reactnative.dev/docs/appstate)

### Cloudflare, data, and server security

- [Cloudflare One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare common Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/common-policies/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Fastify ecosystem plugins](https://fastify.dev/docs/v5.7.x/Guides/Ecosystem/)
- [SQLite Write-Ahead Logging and WAL-reset defect](https://sqlite.org/wal.html)
