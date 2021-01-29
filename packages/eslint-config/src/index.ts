import xo = require("eslint-config-xo/esnext");
import xoReact = require("eslint-config-xo-react");
import { autoImports } from "./auto-import-rules";

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
  extends: [
    "plugin:@typescript-eslint/recommended",
    "eslint:recommended",
    "prettier",
  ].filter(Boolean),
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
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
    "10x/auto-import": [
      "error",
      {
        imports: autoImports,
      },
    ],
    // Enable Remotion specific rules
    "@remotion/no-mp4-import": "warn",
  },
  settings: {
    react: {
      version: "17.0.0",
    },
  },
};
