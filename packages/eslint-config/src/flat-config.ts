import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

const __dirname = new URL('.', import.meta.url).pathname;

import {configs, rules as reactRules} from 'eslint-plugin-react';

import type {Linter} from 'eslint';
import {getRules} from './get-rules.js';

const compat = new FlatCompat({
	recommendedConfig: js.configs.recommended,
	baseDirectory: __dirname,
});

export const remotionFlatConfig = ({
	react,
}: {
	react: boolean;
}): Linter.Config => ({
	languageOptions: {
		parser,
		parserOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
	settings: react
		? {
				react: {
					version: '19.0.0',
				},
			}
		: {},
	plugins: {
		...(react
			? {
					react: {
						configs,
						rules: reactRules,
					},
				}
			: undefined),
		// @ts-expect-error
		'@typescript-eslint': typescriptPlugin,
		...(react ? compat.plugins('react-hooks')[0].plugins : {}),
	},
	rules: getRules(true),
	files: [
		'src/**/*.ts',
		'src/**/*.tsx',
		'src/**/*.js',
		'app/**/*.js',
		'app/**/*.ts',
		'app/**/*.tsx',
	],
});
