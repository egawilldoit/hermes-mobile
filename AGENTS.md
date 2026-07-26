# Hermes Mobile Agent Instructions

These instructions apply to the entire repository. More-specific `AGENTS.md` files under `app/`, `services/hermes-sidecar/`, and `packages/contracts/` add rules for those areas.

## Before any work

1. Read the assigned Linear issue, its parent feature, acceptance criteria, blockers, and linked evidence.
2. Read the current repository state and tests before proposing new code.
3. Read `docs/HERMES_MOBILE_WAYFINDER.md` and `docs/HERMES_MOBILE_MVP_SPEC.md` when they exist on the working branch. Until those documents are merged, use GitHub issues [#2](https://github.com/egawilldoit/hermes-mobile/issues/2) and [#13](https://github.com/egawilldoit/hermes-mobile/issues/13) as product authority.
4. Read every applicable nested `AGENTS.md` before editing files in that subtree.
5. Work only on the assigned issue. Do not select another feature, milestone, or backlog item autonomously.

## Product and architecture authority

Hermes Mobile is a governed Android control plane for Hermes Agent.

- Hermes owns sessions, messages, runs, jobs, approvals, tools, models, skills, memory, and execution truth.
- The Android app renders state and captures governed user intent. It is not an execution engine or workflow source of truth.
- The sidecar is a narrow authentication, authorization, compatibility, integration, notification, reconciliation, and audit boundary.
- Mobile-control Postgres/Supabase stores only mobile-owned device, token, alert, notification, idempotency, compatibility, health, and audit state.
- `packages/contracts` owns portable mobile-sidecar wire knowledge.
- Never create a second Hermes session, run, job, approval, scheduler, memory, or execution engine.
- Never read or mutate Hermes SQLite directly.
- Never expose a generic proxy, arbitrary upstream URL, arbitrary header forwarding, shell, command runner, sudo/root action, or infrastructure-secret operation.
- Unknown routes, capabilities, versions, and evidence fail closed.

## Scope and design principles

Apply these questions in order.

### YAGNI — Is it required now?

Implement only behavior required by the current issue, acceptance criterion, test, security invariant, or verified production constraint.

Do not add speculative features, unused extension points, generic frameworks, premature multi-user or multi-instance machinery, or unrelated cleanup. YAGNI never excuses skipping security, tests, validation, observability, or required architecture.

### KISS — What is the simplest correct design?

Prefer explicit data flow, explicit states, existing patterns, small modules, bounded behavior, and easy rollback. The simplest solution is the one with the fewest unnecessary concepts and hidden interactions, not necessarily the fewest lines.

Do not introduce a factory, strategy hierarchy, plugin system, event bus, repository wrapper, state machine, or new service merely because the pattern exists. Use it only when the current behavior needs it and the result is easier to test and explain.

### DRY — Is duplicated knowledge authoritative?

Centralize duplicated rules and intent: schemas, permission scopes, error codes, event variants, token lifetimes, compatibility rules, feature flags, and lifecycle states.

Do not mechanically combine similar-looking code that represents different policies. Small local duplication is preferable to a premature abstraction that violates YAGNI or KISS.

## Preferred architecture patterns

Use patterns only at real boundaries:

- **Ports and adapters** for Hermes, database, Cloudflare, notifications, secure storage, clocks, and cryptography.
- **Schema-first contracts** for every external request, response, error, and event.
- **Dependency injection** for external effects when it enables deterministic tests or multiple real implementations.
- **Feature-oriented mobile code** that keeps screen, state hook, presentation, and tests close together.
- **Explicit lifecycle models** for authentication, token rotation, alerts, streams, approvals, and idempotent mutations.
- **Thin transport handlers** that delegate policy and integration behavior to focused services.

Avoid base classes, manager/helper dumping grounds, single-use abstractions, and generic repository layers around one simple data source.

## Implementation workflow

1. Restate the authorized scope and identify the source of truth.
2. Inspect existing behavior, call sites, schemas, and tests.
3. Choose the smallest coherent end-to-end change.
4. Preserve current behavior unless the issue explicitly changes it.
5. Update code, runtime contracts, clients, tests, and public documentation together when behavior changes.
6. Run the exact relevant checks after the final edit.
7. Review the diff against the issue and all applicable `AGENTS.md` files.
8. Report changed behavior, commands, results, evidence, and remaining uncertainty.
9. Stop after the assigned issue. Do not begin the next ticket.

## Repository and package-manager rules

The repository intentionally has two package-manager boundaries:

- Repository root/mobile: **pnpm**, authoritative lockfile `pnpm-lock.yaml`.
- `services/hermes-sidecar`: **npm**, authoritative lockfile `package-lock.json`.

Do not introduce another lockfile or convert package managers without a dedicated issue.

Verified commands:

```bash
# Root/mobile dependencies and development
pnpm install --frozen-lockfile
pnpm dev
pnpm android

# Sidecar dependencies and checks
npm ci --prefix services/hermes-sidecar
npm --prefix services/hermes-sidecar run typecheck
npm --prefix services/hermes-sidecar test
npm --prefix services/hermes-sidecar run openapi

# Contracts
pnpm exec tsc -p packages/contracts/tsconfig.json --noEmit
```

The current root package has no dedicated mobile test or lint script. Do not claim those checks passed. Add missing automation only when the current ticket authorizes it; otherwise run the closest valid checks and report the gap.

## Code-quality rules

- Prefer minimal patches over rewrites.
- Do not rename public routes, wire fields, error codes, event types, or configuration keys as cleanup.
- Do not duplicate hooks, clients, schemas, services, lifecycle state, or policy.
- Keep security and business policy out of React components and Fastify route handlers.
- Keep framework-specific code out of shared contracts.
- Make retry, expiry, revocation, stale, reconciliation, and unknown-outcome states explicit.
- Bound retries, timeouts, queues, payloads, list sizes, replay buffers, caches, and retained history.
- Never ignore errors or convert a failed/unknown mutation into success.
- Avoid `any`; validate `unknown` at external boundaries.
- Prefer discriminated unions and named states over ambiguous boolean combinations.
- Prefer immutable transformations and narrow function responsibilities.
- Do not add a production dependency until existing dependencies and platform APIs have been checked. Explain the need in the PR.
- Do not create a helper or abstraction used once unless it isolates a consequential boundary or materially improves testing/readability.
- Split non-mechanical changes above roughly 500 changed lines where practical. Treat changes above roughly 800 lines as a review warning and justify or stage them by complete behavior, not by technical layer.

## Testing rules

Test the highest stable behavioral seam:

1. Mobile-facing sidecar contract and policy behavior.
2. Android navigation/screen behavior.
3. Exact Hermes compatibility behavior.
4. Focused unit tests for pure complex logic.

Additional requirements:

- Every reproducible bug fix gets a regression test.
- Prefer whole-object equality over many field assertions.
- Do not test static constants merely because they exist.
- Do not expose test-only helpers through production APIs.
- Authentication changes cover malformed, expired, revoked, rotated, and refresh-reuse cases.
- Stream changes cover reconnect, replay gap, duplicate, out-of-order, backpressure, and slow-client cases.
- Mutations cover success, denial, duplicate, stale/current-state change, timeout, and unknown-outcome reconciliation.
- UI changes include visual evidence and loading, empty, stale, offline, unauthorized, unsupported, and sanitized-error states where applicable.
- Never hide failures with `|| true`, skipped assertions, weakened expectations, or broad test exclusions.

## Security and production safety

- No Hermes master key, provider key, Cloudflare service credential, Supabase service-role key, push credential, private key, token, cookie, or infrastructure secret in source, APK, Expo public configuration, WebView JavaScript, URLs, deep links, logs, diagnostics, fixtures, snapshots, or push payloads.
- Access tokens should be short-lived; refresh credentials and device private keys use protected native storage.
- Server-side token stores keep hashes, not raw refresh tokens.
- Client-provided biometric booleans are not proof. High-risk actions require server challenge plus device-bound signature.
- Push is advisory; authoritative alert state is fetched from the sidecar.
- Every sensitive mutation is authorized, current, compatible, idempotent, audited, and reconciled before retry.
- Mobile write actions remain disabled until the relevant release gate passes.
- Missing evidence disables the action.

Code-only issues must not use `sudo`, modify users/groups, Docker, systemd, nginx, Cloudflare, SSH, firewall, PM2, timers, Python/SQLite, Hermes configuration, production databases, or production secrets; restart production services; rotate credentials; or deploy automatically. Production operations require explicit human authorization, backup, validation, and rollback evidence.

## Git and pull-request rules

- Use a branch dedicated to one Linear sub-issue.
- Do not commit unrelated files, secrets, databases, logs, caches, generated credentials, or build output.
- Keep commits behavior-oriented and reviewable.
- Do not amend or overwrite another contributor's work without explicit authorization.
- PR description must include the Linear issue, scope, architecture/security impact, checks run, results, screenshots for UI work, compatibility/migration impact, and unresolved uncertainty.
- Do not merge while required blockers, checks, evidence, or human gates are missing.

## Code Review Rules

Review rules capture consequential invariants that are difficult to enforce mechanically. Formatting belongs in CI.

### Authority and data boundary

Flag any duplicate Hermes workflow truth, direct Hermes SQLite access, or canonical transcript/run/job copy outside Hermes.

Safe path: store only mobile-owned metadata and Hermes identifiers; query Hermes through explicit adapters.

### Remote authority expansion

Flag generic proxying, arbitrary URLs/headers, shell or command execution, sudo/root operations, secret submission, permanent/session-wide approval, or capabilities enabled by default.

Safe path: add one explicit operation with runtime schema, permission, feature gate, compatibility check, bounded inputs, idempotency, audit, and tests.

### Breaking integration changes

Flag renames or incompatible changes to routes, wire fields, event types, error codes, token behavior, deep links, environment keys, or persisted schema.

Safe path: preserve the existing contract or add a coordinated versioned/backward-compatible migration across schema, server, client, tests, and documentation.

### Sensitive-data exposure

Flag secrets, raw upstream errors, prompts, tool arguments, commands, paths, or sensitive content in logs, diagnostics, WebView context, URLs, or push payloads.

Safe path: use opaque identifiers, normalized metadata, correlation IDs, and server-side redaction.

### Lifecycle and boundedness

Flag unbounded queues/replay/retries/caches/history, blind retry after uncertain mutations, stale approval execution, or UI controls enabled before current state is known.

Safe path: set hard caps, expose reconciling/unknown states, refresh authoritative state, and fail closed.

### Scope and complexity

Flag speculative features, unrelated refactors, duplicated policy, premature abstractions, or large layer-based changes that cannot be independently verified.

Safe path: implement the smallest end-to-end tracer bullet required by the issue using existing patterns.

## Instruction maintenance

- Keep these files concise enough that the applicable root-plus-nested chain stays below Codex's default 32 KiB instruction limit.
- Put specialized guidance in the nearest nested `AGENTS.md`.
- Describe durable outcomes and invariants, not fragile function names.
- Restart the Codex session after changing instruction files; instructions are assembled at session start.

References:

- [OpenAI: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI: Custom Code Review rules for Codex](https://learn.chatgpt.com/blog/custom-code-review-rules-for-codex)
- [AGENTS.md open format](https://agents.md/)
