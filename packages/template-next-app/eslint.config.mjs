import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/typescript"),
  ...compat.extends("plugin:@next/next/recommended").map((config) => {
    return {
      ...config,
      ignores: ["src/remotion/**"],
    };
  }),
  {
    ...compat.extends("plugin:@remotion/eslint-plugin/recommended")[0],
    files: ["src/remotion/**"],
  },
];

export default eslintConfig;
