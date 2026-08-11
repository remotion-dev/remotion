import {config} from '@remotion/eslint-config-flat';

export default [
	...config,
	{
		ignores: ['**/webpack-override.mjs'],
	},
];
