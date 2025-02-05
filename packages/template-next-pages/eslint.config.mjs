import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const [nextPlugin] = compat.extends("plugin:@next/next/recommended");
const [remotionPlugin] = compat.extends(
  "plugin:@remotion/eslint-plugin/recommended",
);

const eslintConfig = [
  ...compat.extends("next/typescript"),
  nextPlugin,
  {
    ...remotionPlugin,
    files: ["src/remotion/**"],
    rules: {
      ...remotionPlugin.rules,
      ...Object.entries(nextPlugin.rules).reduce((acc, [key]) => {
        return { ...acc, [key]: "off" };
      }, {}),
    },
  },
];

export default eslintConfig;
