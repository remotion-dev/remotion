import { makeConfig } from "@remotion/eslint-config-flat";

export default [
  { ignores: [".react-router/**", "build/**"] },
  ...makeConfig({ remotionDir: "{elements,remotion}/**" }),
];
