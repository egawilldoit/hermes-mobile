# Hermes Mobile

Hermes Mobile is the Android control plane for the Hermes Agent installation running on the `openclaw` VM. It is being built as a **Governed Operator** surface: native operational screens, scoped device identity, a hardened sidecar, explicit permissions, resilient event streaming, redacted notifications, and evidence-bound approvals.

## Product planning

- [Canonical Wayfinder issue](https://github.com/egawilldoit/hermes-mobile/issues/2) — live destination, decisions index, and implementation/evidence frontier.
- [Hermes Mobile Wayfinder Map](docs/HERMES_MOBILE_WAYFINDER.md) — high-resolution decision record, current reality, risks, scope, and source links.
- [Hermes Mobile MVP Specification](docs/HERMES_MOBILE_MVP_SPEC.md) — full product specification, user stories, architecture, contracts, security policy, testing seams, acceptance criteria, and release gates.
- [Documentation pull request](https://github.com/egawilldoit/hermes-mobile/pull/1) — reviewable branch containing the planning artifacts.

## Current repository baseline

GitHub `main` currently contains the initial Expo application template. It was created with:

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Router](https://expo.dev/router)
- [NativeWind](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)

Initialization command:

```bash
npx @react-native-reusables/cli@latest init
```

The operator reported a VM-local `feature/hermes-sidecar-integration` branch containing the consolidated sidecar, contracts, mock API client, and 96 passing sidecar tests. That state is tracked by [Publish and verify the consolidated Hermes Mobile foundation](https://github.com/egawilldoit/hermes-mobile/issues/3) until it is pushed and reproduced on GitHub.

## Development safety

Until the staged release gates pass:

- production Hermes integration remains disabled by default;
- mobile write actions remain disabled;
- push delivery remains disabled in mock development;
- no Hermes, Cloudflare, Supabase service-role, provider, or infrastructure master credential belongs in the mobile repository or APK;
- code-only work must not modify production VM configuration.

## Getting started

Run the current Expo development server:

```bash
npm run dev
```

The current scripts also expose Android, iOS, and web development commands. Android private pilot is the first supported product target; iOS is not a Release One gate.

## Adding UI components

```bash
npx react-native-reusables/cli@latest add [...components]
```

## Current technology baseline

- Expo Router
- React Native New Architecture
- NativeWind/Tailwind styling
- React Native Reusables components
- Typed Expo Router routes
- Android internal APK as the first pilot distribution target

## Primary references

- [Hermes API Server](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md)
- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [SQLite WAL-reset issue](https://sqlite.org/wal.html#the_wal_reset_bug)
