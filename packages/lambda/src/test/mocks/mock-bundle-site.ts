import type {bundle, BundleOptions} from '@remotion/bundler';

const validateOptions = (options: BundleOptions): BundleOptions => {
	if (!options) {
		throw new TypeError('bundle() was called without arguments');
	}

	if (typeof options.entryPoint !== 'string') {
		throw new TypeError('bundle() was called without the `entryPoint` option');
	}

	return options;
};

export const mockBundleSite: typeof bundle = (options) => {
	const {entryPoint} = validateOptions(options);
	if (entryPoint === 'first') {
		return Promise.resolve('/path/to/bundle-1');
	}

	if (entryPoint === 'second') {
		return Promise.resolve('/path/to/bundle-2');
	}

	throw new Error('unknown entry');
};
