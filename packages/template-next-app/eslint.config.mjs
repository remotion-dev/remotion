import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import remotion from "@remotion/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const [nextPlugin] = compat.extends("plugin:@next/next/recommended");

const eslintConfig = [
  ...compat.extends("next/typescript"),
  nextPlugin,
  {
    ...remotion.flatPlugin,
    rules: {
      ...remotion.flatPlugin.rules,
      ...Object.entries(nextPlugin.rules).reduce((acc, [key]) => {
        return { ...acc, [key]: "off" };
      }, {}),
    },
    files: ["src/remotion/**"],
  },
];

export default eslintConfig;
