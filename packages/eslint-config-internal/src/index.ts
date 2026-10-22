import {createRequire} from 'node:module';
import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import parser from '@remotion/typescript-tools/eslint-parser';
import typescriptPlugin from '@remotion/typescript-tools/eslint-plugin';

const require = createRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const {configs, rules: reactRules} = require('eslint-plugin-react');

import {Linter} from 'eslint';
import {rules} from './base.js';
import {noMixedRenderScope} from './no-mixed-render-scope.js';

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
			projectService: false,
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
		'remotion-internal': {
			rules: {
				'no-mixed-render-scope': noMixedRenderScope,
			},
		},
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
	rules: {
		...rules({react}),
		'remotion-internal/no-mixed-render-scope': 'error',
	},
	files: [
		'src/**/*.ts',
		'src/**/*.tsx',
		'src/**/*.js',
		'app/**/*.js',
		'app/**/*.ts',
		'app/**/*.tsx',
	],
});
