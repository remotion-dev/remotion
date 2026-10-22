import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	files: [
		...config.files,
		'components/**/*.ts',
		'components/**/*.tsx',
		'standalone/**/*.ts',
		'standalone/**/*.tsx',
		'generate-option-docs.ts',
		'option-description.ts',
		'option-references.ts',
	],
	rules: {
		...config.rules,
		'no-console': 'off',
	},
};
