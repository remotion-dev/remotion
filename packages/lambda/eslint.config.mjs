import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default [
	{
		...config,
		ignores: ['src/cli/**'],
		rules: {
			...config.rules,
			'no-console': 'off',
			'arrow-body-style': 'off',
			'no-restricted-imports': [
				'error',
				{
					patterns: ['@remotion/cli', '@remotion/*/src/*', 'remotion/src/*'],
					paths: ['remotion', 'react', 'react-dom'],
				},
			],
		},
	},
	{
		...config,
		files: ['src/cli/**.ts'],
		rules: {
			'no-console': 'error',
			'no-restricted-imports': [
				'error',
				{
					patterns: ['@remotion/*/src/*', 'remotion/src/*'],
					paths: ['remotion', 'react', 'react-dom'],
				},
			],
		},
	},
];
