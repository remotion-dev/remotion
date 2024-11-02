import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default {
	...config,
	rules: {
		...config.rules,
		'no-console': 'error',
		'no-restricted-imports': [
			'error',
			{
				patterns: ['@remotion/*/src/*', 'remotion/src/*'],
			},
		],
		'@typescript-eslint/no-use-before-define': 'off',
	},
};
