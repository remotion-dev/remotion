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

export const reactV9Config: Linter.FlatConfig[] = [
	{
		languageOptions: {
			parser: parser,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		plugins: {
			react: {
				configs,
				rules: reactRules,
			},
			// @ts-expect-error
			'@typescript-eslint': typescriptPlugin,
		},
		rules: rules({react: true, enable10x: false}),
		files: ['src/**/*.ts', 'src/**/*.tsx'],
	},
	...compat.plugins('react-hooks'),
];
