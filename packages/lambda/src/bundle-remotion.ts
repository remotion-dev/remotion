import {bundle} from '@remotion/bundler';
import {Internals} from 'remotion';

export const BINARY_NAME = 'remotion-lambda';

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
		enableCaching: false,
		webpackOverride: Internals.getWebpackOverrideFn(),
		publicPath,
	});
};
