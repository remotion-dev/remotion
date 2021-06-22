import {bundle} from '@remotion/bundler';

// TODO: not here
export const BINARY_NAME = 'remotion-lambda';

// TODO: Necessary? No
export const bundleRemotion = ({
	entryFile,
	onProgress,
	publicPath,
}: {
	entryFile: string;
	onProgress: (progress: number) => void;
	publicPath: string;
}) => {
	return bundle(entryFile, onProgress, {
		publicPath,
	});
};
