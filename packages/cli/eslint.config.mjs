import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	rules: {
		...config.rules,
		'no-console': 'error',
		'no-negated-condition': 'off',
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					'@remotion/*/src/*',
					'@remotion/*/src',
					'remotion/src/*',
					'@remotion/*/dist/*',
					'@remotion/*/dist',
					'remotion/dist/*',
				],
			},
		],
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-restricted-imports': [
			'error',
			{
				paths: [
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
				],
			},
		],
	},
};
