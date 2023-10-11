import {startLongRunningCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';

export const extractAudio = async (
	videoSourcePath: string,
	outputPath: string,
	options?: {logLevel?: LogLevel},
) => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: options?.logLevel ?? 'info',
		indent: false,
	});
	await compositor.executeCommand('ExtractAudio', {
		src: videoSourcePath,
		outputPath,
	});
	compositor.finishCommands();
	await compositor.waitForDone();
};
