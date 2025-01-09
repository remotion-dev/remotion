import {getRules} from './get-rules';
import {allowESLintShareableConfig} from './patch-eslint';

const baseExtends = ['eslint:recommended', 'plugin:@remotion/recommended'];

allowESLintShareableConfig();

export = {
	env: {
		browser: true,
		es6: true,
		jest: true,
	},
	plugins: ['react', 'react-hooks', '@typescript-eslint', '10x', '@remotion'],
	extends: baseExtends,
	parser: require.resolve('@typescript-eslint/parser'),
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	overrides: [
		{
			files: ['*.{ts,tsx}'],
			extends: ['plugin:@typescript-eslint/recommended', ...baseExtends],
			parser: '@typescript-eslint/parser',
			rules: getRules(true),
		},
	],
	rules: getRules(false),
	settings: {
		react: {
			version: 'detect',
		},
	},
};
