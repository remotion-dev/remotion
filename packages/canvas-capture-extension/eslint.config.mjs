import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	files: [
		...(config.files ?? []),
		'e2e/**/*.ts',
		'entrypoints/**/*.ts',
		'entrypoints/**/*.tsx',
		'wxt.config.ts',
	],
};
