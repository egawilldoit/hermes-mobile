# Mobile App Agent Instructions

These rules apply to Expo Router application code under `app/`. Root `AGENTS.md` still applies.

## Mobile authority

- The app renders Hermes/sidecar state and captures governed user intent.
- The app is not authoritative for sessions, runs, jobs, approvals, alerts, permissions, compatibility, or audit outcomes.
- Use `@hermes/contracts` and the typed API client. Do not redefine wire types in screens.
- No Hermes master key, service-role key, Cloudflare service token, or server secret belongs in the mobile bundle.

## Structure and design

- Preserve Expo Router and the existing React Native Reusables/NativeWind system.
- Do not create another Expo app or move the existing application without an explicit architecture ticket.
- Prefer feature-oriented folders and small components over one large screen module.
- Keep network, authentication, token, permission, compatibility, event, and reconciliation logic outside presentation components.
- Presentation components receive explicit data and callbacks; they do not call Hermes directly or implement authorization policy.
- Prefer route-local state and server/query state. Add global state only for genuinely cross-cutting session, theme, connectivity, or device concerns.
- Prefer discriminated UI states over combinations of `isLoading`, `hasError`, `isOffline`, and `isStale` booleans that can contradict each other.
- Do not introduce a generic component abstraction until at least two real consumers share the same behavior and semantics.

## Required screen behavior

Where relevant, every screen supports:

- loading;
- empty;
- current;
- stale/cached;
- offline;
- reconnecting/reconciling;
- dependency degraded;
- unauthorized or revoked device;
- unsupported app/Hermes version;
- sanitized error with correlation ID.

A stale, unsupported, revoked, or reconciling screen must not leave a mutation control enabled.

## Navigation and lifecycle

- Use Expo Router route groups and protected-route patterns for authenticated areas.
- Preserve Android back behavior; do not trap the user in WebView or modal routes.
- Deep links and notification routes contain opaque identifiers only, then fetch current authoritative state.
- On `AppState` return to `active`, refresh authentication as needed, reconnect streams, reconcile visible data, and enable controls only after current state is known.
- Network switching and reconnect must not duplicate visible events or repeat mutations.

## UI and accessibility

- Reuse existing components and theme tokens before adding new primitives.
- Support light and dark themes.
- Meet Android touch-target expectations and provide accessible names, roles, states, and hints.
- Do not communicate severity using color alone.
- Announce meaningful loading, error, and connection-state changes.
- Keep operational hierarchy stable: approvals and failures before routine activity.
- Avoid dense dashboards; show the minimum information required to understand and act safely.

## Authentication and sensitive actions

- Keep access tokens memory-resident where practical.
- Store refresh credentials and device private keys only through approved SecureStore/Keystore adapters.
- Never place tokens in URLs, route parameters, logs, diagnostics, AsyncStorage, or WebView JavaScript.
- Biometrics alone are not server proof. High-risk actions require a server nonce and device-bound signature.
- Approval decisions are never available directly from a lock-screen notification.
- Do not render secret-bearing raw upstream errors, tool arguments, commands, repository paths, or provider payloads.

## WebView rules

When a ticket explicitly selects WebView reuse:

- Allow only approved HTTPS origins and deny navigation escape.
- Keep the message bridge minimal and schema validated.
- Do not inject the Hermes master key or refresh token.
- Do not enable arbitrary JavaScript/native methods.
- Clear or isolate sensitive storage according to the accepted auth design.
- Test keyboard, back, lifecycle, external links, reconnect, and credential exposure on Android.

## Testing and evidence

- Prefer screen/navigation tests against deterministic contracts over component-internal tests.
- Test visible states and absence/disabled state of unauthorized actions.
- Test `AppState` foreground reconciliation, network loss, reconnect, duplicate events, and stale notification navigation.
- Test diagnostics and error UI for secret redaction.
- Every user-visible change needs screenshots or a short recording for the target Android form factor.
- The current repository has no dedicated mobile test/lint script. Do not claim one ran; add or use it only when authorized by the ticket.

## Code Review Rules

### Client-side authority

Flag permission, approval, compatibility, or workflow truth implemented only in the app.

Safe path: render server-provided policy/state and enforce the same rule authoritatively in the sidecar.

### Contract duplication

Flag screen-local copies of sidecar request, response, error, permission, or event types.

Safe path: consume `@hermes/contracts` and the typed client.

### Secret and WebView exposure

Flag tokens or sensitive operational content in Expo public config, storage, URLs, logs, diagnostics, notification payloads, injected scripts, or WebView JavaScript.

Safe path: keep credentials in native protected adapters and fetch redacted current state from the sidecar.

### Unsafe stale-state actions

Flag controls enabled while data is stale, offline, unsupported, revoked, or reconciling.

Safe path: disable the action, explain why, refresh authoritative state, then re-evaluate policy.
