import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

const typeOnlyImports = [
	{
		name: 'zod',
		message: 'Can only import zod as a type',
		allowTypeImports: true,
	},
	{
		name: '@remotion/zod-types',
		message: 'Can only import @remotion/zod-types as a type',
		allowTypeImports: true,
	},
];

export default [
	{
		...config,
		rules: {
			...config.rules,
			'no-console': 'error',
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						'@remotion/*/src',
						'@remotion/*/src/*',
						'@remotion/*/dist/*',
						'remotion/src/*',
					],
				},
			],
			'@typescript-eslint/no-use-before-define': 'off',
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: typeOnlyImports,
				},
			],
		},
	},
	{
		files: config.files,
		ignores: ['src/test/**'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						...typeOnlyImports,
						{
							name: '@remotion/codemods',
							message:
								'Load codemods with a dynamic import only in Browser Studio so regular Studio does not download them.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	},
];
