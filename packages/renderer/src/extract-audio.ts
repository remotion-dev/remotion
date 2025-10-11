import {startLongRunningCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';

/*
 * @description Extracts the audio from a video source and saves it to the specified output path. It does not convert the audio to a different format.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/extract-audio)
 */
export const extractAudio = async (options: {
	videoSource: string;
	audioOutput: string;
	logLevel?: LogLevel;
	binariesDirectory?: string | null;
}) => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: options?.logLevel ?? 'info',
		indent: false,
		binariesDirectory: options.binariesDirectory ?? null,
		extraThreads: 0,
	});
	await compositor.executeCommand('ExtractAudio', {
		input_path: options.videoSource,
		output_path: options.audioOutput,
	});
	await compositor.finishCommands();
	await compositor.waitForDone();
};
