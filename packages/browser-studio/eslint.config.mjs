import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	files: [...config.files, 'e2e/**/*.ts', 'e2e/**/*.tsx', 'playwright.config.ts'],
};
