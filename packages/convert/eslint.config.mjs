import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

const flatConfig = {
	...config,
	rules: {
		...config.rules,
		'no-console': 'error',
	},
};

export default flatConfig;
