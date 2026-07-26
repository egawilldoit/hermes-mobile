# Hermes Sidecar Agent Instructions

These rules apply to `services/hermes-sidecar/`. Root `AGENTS.md` still applies.

## Sidecar authority

The sidecar is a narrow server-side security and integration boundary.

It may:

- validate enrollment and trusted-device identity;
- issue, rotate, hash, detect reuse of, and revoke mobile credentials;
- enforce explicit permissions and compatibility policy;
- protect the Hermes bearer credential;
- adapt a finite set of Hermes operations;
- normalize and reconcile events;
- generate redacted alerts and push requests;
- persist mobile-owned state, idempotency, and audit evidence.

It may not:

- expose a generic proxy or arbitrary upstream path/URL;
- forward arbitrary client headers;
- execute shell commands;
- grant sudo/root or infrastructure authority;
- access Hermes SQLite;
- duplicate Hermes sessions, runs, jobs, approvals, scheduler, memory, or execution truth.

## Runtime and package boundary

Use npm in this directory. `package-lock.json` is authoritative.

```bash
npm ci
npm run typecheck
npm test
npm run openapi
```

Run commands from this directory or use the root `npm --prefix services/hermes-sidecar ...` equivalents. Do not use pnpm to rewrite the sidecar lockfile.

## Architecture

- Register every public route explicitly. Unknown routes return `404`.
- Keep route handlers thin: parse input, call an application service, map the explicit result.
- Keep authentication, authorization, compatibility, idempotency, lifecycle, and audit policy out of handlers.
- Use ports/adapters for Hermes, database, clock, randomness, signing/verification, push provider, and audit persistence.
- Inject external effects when deterministic tests or multiple real implementations require it.
- Avoid a generic repository abstraction around a single direct query set.
- Keep modules focused. Add a new module instead of extending a high-touch file with unrelated responsibilities.
- Do not create a helper used once unless it isolates a consequential boundary or materially improves testability.

## Contracts and validation

- Validate all external input and output at runtime.
- Treat TypeScript types alone as insufficient for network, environment, database, and Hermes data.
- Use `@hermes/contracts` for portable mobile-facing wire knowledge once the versioned contract is frozen.
- Keep Hermes-internal adapter types separate from the public mobile contract.
- Use explicit discriminated unions for lifecycle and error results.
- Preserve route names, wire fields, error codes, event types, token semantics, and environment keys unless the current issue authorizes a coordinated migration.
- List endpoints and replay operations must have hard bounds.

## Authentication and authorization

- Never log or return the Hermes bearer credential, raw refresh tokens, private keys, cookies, authorization codes, or signed device challenges.
- Store only refresh-token hashes server-side.
- Rotate refresh tokens on successful use and detect old-token reuse.
- Reuse detection revokes the token family/device session according to policy.
- Validate issuer, audience, expiry, state, PKCE binding, device identity, and required scope.
- Authorization is deny by default. Unknown scope/capability/version is unavailable.
- Client-provided biometric success is not trusted. Verify server nonce, active device, operation digest, expiry, and device signature.
- High-risk operations require current authoritative evidence immediately before forwarding.

## Hermes integration

- Hermes remains the sole authority for session, message, run, job, approval, tool, and execution state.
- Use explicit adapters for each accepted Hermes operation.
- The API server on port `8642` is HTTP/SSE; do not assume it exposes WebSocket.
- Inject the Hermes bearer key server-side and never forward it to clients.
- Do not copy full transcripts, raw tool output, or canonical Hermes records into mobile-control storage.
- On upstream timeout or lost response, mark the outcome unknown and reconcile current Hermes state before any retry.
- Unsupported Hermes versions preserve only reads explicitly classified as safe; mutations fail closed.

## Events, alerts, and bounded resources

- Mobile WebSocket is a sidecar relay, not a claim about Hermes port `8642`.
- Event envelopes include identity, type, sequence/replay data, timestamp, and redacted payload.
- Bound connections per device, subscriptions, replay history, per-client queues, payload size, heartbeat, and timeouts.
- Deduplicate events and reconcile current state after gaps or out-of-order delivery.
- Disconnect slow consumers rather than allowing unbounded memory growth.
- Do not persist token deltas.
- Push delivery is best effort; the alert record is authoritative.
- Notification payloads contain opaque routing identifiers and generic text only.

## Error handling and logging

- Use stable sanitized error codes and correlation/request IDs.
- Never return raw upstream/provider/database errors to mobile clients.
- Never log tokens, cookies, authorization headers, prompts, tool arguments, commands, paths, or secret-bearing response bodies.
- Redact before structured logging; do not rely on callers to sanitize.
- Do not catch and ignore errors. Map expected failures explicitly and let unexpected failures reach the centralized handler safely.
- Never convert `timeout`, `unknown`, or `reconciling` into success.

## Database and audit

- Use a dedicated least-privilege role and non-public mobile-control schema.
- Persist only mobile-owned state.
- Apply retention and uniqueness constraints in migrations, not only application code.
- Keep migrations additive and reviewable. Do not apply production migrations from a code-only ticket.
- Sensitive mutations use durable idempotency records.
- Same key and same payload returns the original result; same key with a different payload is rejected.
- Audit evidence is append-only and contains normalized metadata, digest, principal/device/instance, decision, and outcome—not raw secrets or full content.

## Tests

Prefer Fastify injection and boundary-level tests against deterministic dependencies.

Required coverage when relevant:

- valid, malformed, missing, expired, revoked, wrong-scope, and rate-limited requests;
- refresh rotation, reuse/theft detection, and device revocation;
- unknown route, forbidden route pattern, arbitrary URL/path/header attempts;
- secret redaction and stable error contracts;
- replay, duplicate, gap, out-of-order, backpressure, heartbeat, and slow consumer;
- idempotency, stale state, timeout, duplicate request, and unknown-outcome reconciliation;
- feature flags and compatibility fail-closed behavior;
- no direct Hermes SQLite or shell dependency.

Do not weaken the existing security-negative tests to make a change pass.

## Code Review Rules

### Generic proxy or authority escape

Flag any route or adapter that accepts arbitrary Hermes paths, URLs, headers, commands, tools, or infrastructure operations.

Safe path: add one explicit allowlisted operation with runtime schema, scope, compatibility, bounds, idempotency, audit, and tests.

### Hermes source-of-truth duplication

Flag direct SQLite access or persistence of canonical sessions, runs, jobs, approvals, transcripts, or raw tool output.

Safe path: persist identifiers and mobile-owned lifecycle/audit metadata, then reconcile through Hermes APIs.

### Authentication weakening

Flag raw refresh storage, missing rotation/reuse detection, client-trusted biometrics, missing issuer/audience/device/scope validation, or permissive unknown scopes.

Safe path: hash and rotate credentials, verify server challenges/device signatures, and deny unknown state.

### Unbounded or unreliable streaming

Flag unbounded replay/queues/connections, blind retries, missing gap reconciliation, or token-delta persistence.

Safe path: add hard limits, explicit reconciling state, current-state refresh, and slow-consumer handling.

### Sensitive observability

Flag raw upstream errors, credentials, commands, tool arguments, prompts, or paths in logs/responses/audit.

Safe path: normalized codes, redacted metadata, opaque identifiers, and correlation IDs.
