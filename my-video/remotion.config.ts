/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';
import { enableSkia } from "@remotion/skia/enable";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig((currentConfiguration) => {
  const withSkia = enableSkia(enableTailwind(currentConfiguration), { bundler: "rspack" });
  return {
    ...withSkia,
    resolve: {
      ...withSkia.resolve,
      // @shopify/react-native-skia's published "main"/"module" entry is a
      // React Native (Metro) build that unconditionally imports the
      // `react-native` package, which doesn't exist in a browser bundle.
      // Its package.json points bundlers that honor the "react-native"
      // main field at its TS source instead, where per-file .web.tsx
      // variants (resolved via the extensions enableSkia() adds above)
      // provide the browser implementation. rspack doesn't read that main
      // field, so alias the bare import to the source directly.
      alias: {
        ...withSkia.resolve?.alias,
        "@shopify/react-native-skia$": "@shopify/react-native-skia/src",
        // Some of react-native-skia's shared (non-.web.tsx) source files
        // still import real react-native APIs (e.g. Platform) unconditionally.
        "react-native$": "react-native-web",
      },
    },
  };
});
