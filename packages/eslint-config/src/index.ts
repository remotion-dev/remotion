import xo = require("eslint-config-xo/esnext");
import xoReact = require("eslint-config-xo-react");
import { autoImports } from "./auto-import-rules";

const baseExtends = ["eslint:recommended", "prettier"];

export = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Text: "off",
    StyleSheet: "off",
  },
  plugins: [
    ...xoReact.plugins,
    "@typescript-eslint/eslint-plugin",
    "react",
    "10x",
    "@remotion",
  ],
  extends: baseExtends,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: ["plugin:@typescript-eslint/recommended", ...baseExtends],
      parser: "@typescript-eslint/parser",
    },
  ],
  rules: {
    ...xo.rules,
    ...xoReact.rules,
    "no-console": "off",
    "10x/react-in-scope": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-key": "off",
    "react/jsx-no-target-blank": "off",
    "react/jsx-tag-spacing": "off",
    "react/prop-types": "off",
    // The following rules are handled by typescript-eslint
    "no-unused-vars": "off",
    "no-undef": "off",
    "no-shadow": "off",
    // In Video.tsx we encourage using fragment for just a single composition
    // since we intend to add more compositions later and you should then use a fragment.
    "react/jsx-no-useless-fragment": "off",
    // This is generally okay because on every frame, there will be a full rerender anyway!
    "react/no-array-index-key": "off",
    "10x/auto-import": [
      "error",
      {
        imports: autoImports,
      },
    ],
    // Enable Remotion specific rules
    "@remotion/no-mp4-import": "warn",
    "@remotion/warn-native-media-tag": "warn",
    // Using `require` is useful for importing PNG sequences: require('frame' + frame + '.png')
    "@typescript-eslint/no-var-requires": "off",
  },
  settings: {
    react: {
      version: "17.0.0",
    },
  },
};
