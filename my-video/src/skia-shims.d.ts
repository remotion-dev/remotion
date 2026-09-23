// @shopify/react-native-skia's TS source ships (and its "types" field's
// compiled declarations mirror) some cross-platform files that still
// reference the native `react-native`/`react-native-reanimated` packages
// for types we never actually use here (Platform detection, Reanimated
// shared values) — the web build we target via enableSkia()'s bundler
// alias never touches those code paths. Neither package is installed
// (react-native-web substitutes for `react-native` at bundle time; see
// remotion.config.ts), so this project's own strict tsc pass can't resolve
// them without these ambient stubs.
declare module "react-native";
declare module "react-native-reanimated";
