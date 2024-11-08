import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default {
	...config,
	rules: {
		...config.rules,
		'no-restricted-imports': [
			'error',
			{
				patterns: ['@remotion/*/src/*', 'remotion/src/*'],
			},
		],
	},
};
