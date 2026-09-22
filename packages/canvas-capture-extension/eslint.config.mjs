import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	files: [
		...(config.files ?? []),
		'entrypoints/**/*.ts',
		'entrypoints/**/*.tsx',
		'wxt.config.ts',
	],
};
