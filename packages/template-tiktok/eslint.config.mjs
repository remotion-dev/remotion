import { remotionFlatConfig } from "@remotion/eslint-config";

const config = remotionFlatConfig({ react: true });

export default {
  ...config,
  rules: {
    ...config.rules,
    "no-console": "error",
  },
  globals: {
    process: "readonly",
  },
};
