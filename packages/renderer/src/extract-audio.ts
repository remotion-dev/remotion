import {startLongRunningCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';

export const extractAudio = async (options: {
	videoSource: string;
	audioOutput: string;
	logLevel?: LogLevel;
}) => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: options?.logLevel ?? 'info',
		indent: false,
	});
	await compositor.executeCommand('ExtractAudio', {
		input_path: options.videoSource,
		output_path: options.audioOutput,
	});
	await compositor.finishCommands();
	await compositor.waitForDone();
};
