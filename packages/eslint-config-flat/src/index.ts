import eslint from '@eslint/js';
import remotionPlugin from '@remotion/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export const makeConfig = ({
	remotionDir,
}: {
	remotionDir: string | undefined;
}): tseslint.ConfigArray =>
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
				react: reactPlugin,
				'react-hooks': hooksPlugin,
			},
			languageOptions: {
				...reactPlugin.configs.flat.recommended.languageOptions,
				parser: tseslint.parser,
				parserOptions: {
					projectService: false,
				},
			},
			rules: {
				// wrong types 🙈
				...(reactPlugin.configs.flat
					.rules as unknown as typeof reactPlugin.configs.flat.rules.rules),
				...hooksPlugin.configs.recommended.rules,
				// Turning off rules that are too strict or don't apply to Remotion
				'no-console': 'off',
				'react/jsx-key': 'off',
				'react/jsx-no-target-blank': 'off',
				// In Root.tsx we encourage using fragment for just a single composition
				// since we intend to add more compositions later and you should then use a fragment.
				'react/jsx-no-useless-fragment': 'off',
				// This is generally okay because on every frame, there will be a full rerender anyway!
				'react/no-array-index-key': 'off',
			},
			settings: {
				react: {
					version: 'detect',
				},
			},
		},
		{
			plugins: {
				'@remotion': remotionPlugin,
			},
			rules: remotionPlugin.configs.recommended.rules,
			...(remotionDir ? {files: [remotionDir]} : {}),
		},
	);

export const config: tseslint.ConfigArray = makeConfig({
	remotionDir: undefined,
});
