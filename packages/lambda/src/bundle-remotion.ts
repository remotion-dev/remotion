import {bundle} from '@remotion/bundler';

export const BINARY_NAME = '@remotion/lambda';

export const bundleRemotion = (entryFile: string) => {
	return bundle(entryFile, () => undefined, {
		enableCaching: false,
	});
};
