import type {bundle, BundleOptions} from '@remotion/bundler';

const convertArgumentsIntoOptions = (
	args: Parameters<typeof bundle>,
): BundleOptions => {
	if ((args.length as number) === 0) {
		throw new TypeError('bundle() was called without arguments');
	}

	const firstArg = args[0];
	if (typeof firstArg === 'string') {
		return {
			entryPoint: firstArg,
			onProgress: args[1],
			...(args[2] ?? {}),
		};
	}

	if (typeof firstArg.entryPoint !== 'string') {
		throw new TypeError('bundle() was called without the `entryPoint` option');
	}

	return firstArg;
};

export const mockBundleSite: typeof bundle = (...args) => {
	const {entryPoint} = convertArgumentsIntoOptions(args);
	if (entryPoint === 'first') {
		return Promise.resolve('/path/to/bundle-1');
	}

	if (entryPoint === 'second') {
		return Promise.resolve('/path/to/bundle-2');
	}

	throw new Error('unknown entry');
};
