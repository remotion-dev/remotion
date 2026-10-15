import eslint from '@eslint/js';
import remotionPlugin from '@remotion/eslint-plugin';
import type {Linter} from 'eslint';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export const makeConfig = ({
	remotionDir,
}: {
	remotionDir: string | undefined;
}): Linter.Config[] =>
	tseslint.config(
		{
			ignores: [
				'**/build/**',
				'**/dist/**',
				'**/out/**',
				'eslint.config.mjs',
				'remotion.config.ts',
				'remotion.config.js',
			],
		},
		eslint.configs.recommended,
		tseslint.configs.eslintRecommended,
		tseslint.configs.recommended,
		{
			plugins: {
				'react-hooks': hooksPlugin,
			},
			languageOptions: {
				parser: tseslint.parser,
				parserOptions: {
					ecmaFeatures: {jsx: true},
					projectService: false,
				},
			},
			rules: {
				'react-hooks/rules-of-hooks': 'error',
				'react-hooks/exhaustive-deps': 'warn',
				// Turning off rules that are too strict or don't apply to Remotion
				'no-console': 'off',
				'no-use-before-define': 'off',
				'@typescript-eslint/no-use-before-define': 'off',
				'@typescript-eslint/no-empty-object-type': 'off',
			},
		},
		{
			plugins: {
				'@remotion': remotionPlugin,
			},
			rules: {
				...remotionPlugin.configs.recommended.rules,
				'@remotion/valid-composition-and-folder-name': 'error',
			},
			...(remotionDir ? {files: [remotionDir]} : {}),
		},
	) as Linter.Config[];

export const config: Linter.Config[] = makeConfig({
	remotionDir: undefined,
});
