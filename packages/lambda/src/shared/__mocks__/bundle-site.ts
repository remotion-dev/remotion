import type {bundle} from '@remotion/bundler';

export const bundleSite: typeof bundle = (entry: string) => {
	if (entry.endsWith('first')) {
		return Promise.resolve('/path/to/bundle-1');
	}

	if (entry.endsWith('second')) {
		return Promise.resolve('/path/to/bundle-2');
	}

	throw new Error('unknown entry');
};
