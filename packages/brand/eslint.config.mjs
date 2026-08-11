import {remotionFlatConfig} from '@remotion/eslint-config-internal';

const config = remotionFlatConfig({react: true});

export default {
	...config,
	ignores: [...(config.ignores ?? []), 'src/HomepageAssets/**'],
};
