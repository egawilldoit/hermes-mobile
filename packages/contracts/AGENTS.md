# Shared Contracts Agent Instructions

These rules apply to `packages/contracts/`. Root `AGENTS.md` still applies.

## Contract authority

This package is the single authoritative representation of portable mobile-sidecar wire knowledge.

Allowed here:

- runtime-validatable request, response, error, and event schemas;
- TypeScript types derived from those schemas where possible;
- opaque identifier types;
- discriminated lifecycle and event unions;
- permission-scope names;
- bounded pagination and compatibility metadata;
- portable schema/version helpers.

Prohibited here:

- Fastify or server route implementations;
- database adapters or SQL;
- Node filesystem, process, crypto-provider, or environment loading;
- Expo, React Native, navigation, hooks, or UI components;
- service implementations, network clients, token stores, or secret handling;
- platform-specific business logic.

## Current-state warning

The current package contains TypeScript interfaces and constants but no runtime schema library. Do not claim external data is runtime validated by this package until the versioned schema work is implemented and tested.

When the authorized contract ticket introduces runtime schemas, migrate deliberately and keep the mobile client, sidecar, tests, and documentation coordinated. Do not perform a broad schema rewrite as unrelated cleanup.

## Schema-first rules

- Treat all network, deep-link, storage, database, and Hermes-derived data as `unknown` until validated at the owning boundary.
- Prefer one runtime schema as the source from which TypeScript types are derived.
- Use explicit discriminated unions for lifecycle, event, and result variants.
- Prefer named states or enums over ambiguous combinations of booleans.
- Keep identifiers opaque at the wire boundary. Parse domain-specific formats only inside the owning adapter.
- Preserve the repository's established wire naming and timestamp formats unless a ticket authorizes a coordinated migration.
- Define hard bounds for list limits, payload sizes, replay counts, and free-form text where the contract can enforce them.
- List endpoints must support bounded pagination before unbounded data is possible.
- Optional fields must have a documented semantic meaning. Do not use optionality to hide incompatible states.
- Error contracts use stable machine-readable codes plus sanitized human-readable messages and correlation IDs where applicable.
- Event envelopes identify event type, entity, Hermes instance, occurrence time, replay/sequence information, and redacted payload.

## DRY without premature abstraction

Centralize knowledge that must remain identical across mobile and sidecar:

- route payloads;
- error codes;
- permission scopes;
- event variants;
- token/session metadata;
- compatibility/version results;
- alert and approval lifecycle states.

Do not combine concepts merely because their current fields look similar. Session state, run state, job state, alert state, and approval state may evolve independently and should remain separate unless they represent the same authoritative knowledge.

Avoid generic `BaseResponse`, `Entity`, `Status`, or catch-all event payloads that erase domain meaning. Prefer small explicit contracts.

## Compatibility and versioning

- A public contract change must update schema, derived types, sidecar adapter, typed mobile client, fixtures, tests, OpenAPI/documentation, and compatibility policy together.
- Do not silently rename or remove routes, fields, enum values, error codes, permission scopes, or event variants.
- Additive compatible changes are preferred when they remain unambiguous.
- Breaking changes require an explicit version or coordinated migration and a defined old-client behavior.
- Unknown event or capability variants must fail safely; they must not grant authority.
- Keep compatibility rules explicit and testable rather than inferred from package version alone.

## Dependency rules

- Keep this package portable and free of Node-only, Expo-only, React Native-only, Fastify, database, and UI dependencies.
- Before adding a schema dependency, verify it can be consumed by both the sidecar and the React Native bundler and that it does not pull server-only code into the app.
- Do not add a dependency solely for type aliases or trivial helpers.
- Keep public exports deliberate; do not export internal helper implementation by default.

## Testing

When runtime schemas exist, tests should cover:

- representative valid payloads;
- malformed and oversized payloads;
- missing required fields and invalid discriminants;
- every union variant;
- backward-compatible decoding where promised;
- round-trip or golden-vector compatibility between mobile and sidecar;
- stable error/event serialization;
- rejection of unknown permission or authority-expanding values.

Prefer deep equality on complete decoded/encoded objects. Do not add tests that merely restate static constant values without behavior.

The verified current check is:

```bash
pnpm exec tsc -p packages/contracts/tsconfig.json --noEmit
```

Do not claim runtime-schema or contract behavior tests passed until those tests exist and are run.

## Code Review Rules

### Framework leakage

Flag Fastify, Node runtime, database, Expo, React Native, UI, environment, or secret-handling dependencies in this package.

Safe path: keep the contract portable and move platform behavior to the owning adapter or application module.

### Type-only trust boundary

Flag external data cast directly to a TypeScript interface without runtime validation.

Safe path: validate `unknown` with the authoritative runtime schema at the boundary, then use the derived type.

### Duplicated wire knowledge

Flag route payloads, errors, events, permissions, or lifecycle values independently redefined in mobile or sidecar code.

Safe path: define the portable knowledge once here and consume or generate it from both sides.

### Silent breaking change

Flag removal, rename, semantic change, or narrowed enum/field behavior without coordinated versioning and compatibility evidence.

Safe path: preserve compatibility or implement an explicit versioned migration across schema, server, client, fixtures, tests, and documentation.

### Over-generic abstraction

Flag catch-all schemas or base entities that collapse distinct domain policies and make invalid combinations representable.

Safe path: use the smallest explicit domain contract required by the current issue.
