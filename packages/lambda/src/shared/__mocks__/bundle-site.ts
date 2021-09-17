import {bundle} from '@remotion/bundler';

export const bundleSite: typeof bundle = () => {
	return Promise.resolve('/path/to/bundle-1');
};
