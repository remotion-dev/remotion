import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default [
	{
		...config,
		rules: {
			...config.rules,
			'@typescript-eslint/no-use-before-define': 'off',
		},
		ignores: ['src/browser/**'],
	},
	{
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: ['@remotion/*/src/*', 'remotion/src/*'],
					paths: [
						{
							name: 'remotion',
							message: 'Dont import the runtime',
							allowTypeImports: true,
						},
						{
							name: 'react',
							message: 'Dont import the runtime',
							allowTypeImports: true,
						},
						{
							name: 'react-dom',
							message: 'Dont import the runtime',
							allowTypeImports: true,
						},
					],
				},
			],
		},
		ignores: ['src/test/**'],
	},
	{
		...config,
		files: ['src/test/**'],
	},
];
