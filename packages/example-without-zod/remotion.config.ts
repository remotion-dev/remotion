import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        zod: "undefined.js",
        "@remotion/z-color": "undefined.js",
      },
    },
  };
});
