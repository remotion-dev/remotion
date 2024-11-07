import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default {
	...config,
	rules: {
		...config.rules,
		'no-console': 'error',
		'react/function-component-definition': 'off',
		'react/require-default-props': 'off',
	},
};
