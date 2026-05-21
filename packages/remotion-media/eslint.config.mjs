import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default [
	...(Array.isArray(config) ? config : [config]),
	{
		ignores: ['src/compositions/**'],
	},
];
