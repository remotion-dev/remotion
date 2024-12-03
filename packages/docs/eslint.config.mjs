import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	files: [...config.files, 'components/**/*.ts', 'components/**/*.tsx'],
	rules: {
		...config.rules,
		'no-console': 'off',
	},
};
