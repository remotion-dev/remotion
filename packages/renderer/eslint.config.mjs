import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default [
	{
		...config,
		rules: {
			...config.rules,
			'@typescript-eslint/no-use-before-define': 'off',
			'no-restricted-imports': [
				'error',
				{
					patterns: ['@remotion/*/src/*', 'remotion/src/*'],
					paths: ['remotion', 'react', 'react-dom'],
				},
			],
		},
		ignores: ['src/browser/**'],
	},
	{
		...config,
		files: ['src/test/**'],
	},
];
