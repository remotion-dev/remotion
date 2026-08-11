import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default [
	config,
	{
		files: ['src/scripts/**'],
		rules: {
			'no-console': 'off',
			'prefer-destructuring': 'off',
		},
	},
];
