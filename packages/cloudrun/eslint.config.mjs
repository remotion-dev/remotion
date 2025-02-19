import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: false});

export default [
	{
		...config,
		ignores: ['./src/gcpInstaller/**', 'src/admin/**'],
		rules: {
			...config.rules,
			'no-console': 'error',
		},
	},
	{
		files: ['./src/gcpInstaller/**'],
		rules: {
			...config.rules,
			'no-console': 'off',
		},
	},
	{
		files: ['src/admin/**'],
		rules: {
			...config.rules,
			'no-console': 'off',
		},
	},
];
