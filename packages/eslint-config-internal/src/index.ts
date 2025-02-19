import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const {configs, rules: reactRules} = require('eslint-plugin-react');

import {Linter} from 'eslint';
import {rules} from './base.js';

const compat = new FlatCompat({
	recommendedConfig: js.configs.recommended,
	baseDirectory: __dirname,
});

export const remotionFlatConfig = ({
	react,
}: {
	react: boolean;
}): Linter.FlatConfig => ({
	languageOptions: {
		parser: parser,
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
	rules: rules({react}),
	files: [
		'src/**/*.ts',
		'src/**/*.tsx',
		'src/**/*.js',
		'app/**/*.js',
		'app/**/*.ts',
		'app/**/*.tsx',
	],
});
