import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});
import { config } from "@remotion/eslint-config-flat";

export default [
	...config,
	...compat.extends("plugin:@withfig/fig-linter/recommended"),
];
