# Hermes Mobile

Hermes Mobile is the Android control plane for the Hermes Agent installation running on the `openclaw` VM. The application is being built as a governed operator surface: native operational screens, scoped device identity, a hardened sidecar, explicit permissions, resilient event streaming, redacted notifications, and evidence-bound approvals.

## Product documentation

- [Hermes Mobile Wayfinder Map](docs/HERMES_MOBILE_WAYFINDER.md) — destination, decisions already made, current reality, evidence frontier, risks, and out-of-scope boundaries.
- [Hermes Mobile MVP Specification](docs/HERMES_MOBILE_MVP_SPEC.md) — full product specification, user stories, architecture, contracts, security model, testing strategy, acceptance criteria, and release gates.

## Current repository baseline

This repository was initialized as a [React Native](https://reactnative.dev/) project using [Expo](https://expo.dev/), [Expo Router](https://expo.dev/router), [NativeWind](https://www.nativewind.dev/), and [React Native Reusables](https://reactnativereusables.com).

It was initialized using:

```bash
npx @react-native-reusables/cli@latest init
```

The product documentation distinguishes the GitHub-visible template baseline from the consolidated sidecar and contracts branch reported on the `openclaw` VM but not yet pushed at the time the documents were written.

## Getting Started

To run the development server:

```bash
npm run dev
```

This starts the Expo development server. The current project scripts also support Android, iOS, and web development targets.

## Adding components

Add reusable components with:

```bash
npx react-native-reusables/cli@latest add [...components]
```

## Project Features

- Built with Expo Router
- Styled with Tailwind CSS through NativeWind
- UI components from React Native Reusables
- React Native New Architecture enabled
- Typed Expo Router routes enabled
- Android private pilot is the first product target

## References

- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [Expo documentation](https://docs.expo.dev/)
- [NativeWind documentation](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)
- [EAS Build](https://docs.expo.dev/build/introduction/)
