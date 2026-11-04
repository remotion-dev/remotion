import { makeConfig } from "@remotion/eslint-config-flat";
import assetsAsProps from "./eslint/assets-as-props.mjs";
import interactiveName from "./eslint/interactive-name.mjs";
import noGlobalStyles from "./eslint/no-global-styles.mjs";
import selfContained from "./eslint/self-contained.mjs";

export default [
  { ignores: [".react-router/**", "build/**"] },
  ...makeConfig({ remotionDir: "{elements,remotion}/**" }),
  {
    files: ["elements/**/*.tsx"],
    plugins: {
      elements: {
        rules: {
          "assets-as-props": assetsAsProps,
          "self-contained": selfContained,
          "no-global-styles": noGlobalStyles,
          "interactive-name": interactiveName,
        },
      },
    },
    rules: {
      "elements/assets-as-props": "error",
      "elements/self-contained": "error",
      "elements/no-global-styles": "error",
      "elements/interactive-name": "warn",
      // The Element rule replaces the general advice to import local assets.
      "@remotion/no-string-assets": "off",
    },
  },
];
