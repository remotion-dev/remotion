import {bundle} from '@remotion/bundler';

export const BINARY_NAME = '@remotion/lambda';

export const bundleRemotion = (
	entryFile: string,
	onProgress: (progress: number) => void
) => {
	return bundle(entryFile, onProgress, {
		enableCaching: false,
	});
};
