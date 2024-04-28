import {startLongRunningCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';

/**
 * @description Extracts the audio from a video source and saves it at the specified output path without changing the audio format.
 * @see [Documentation](https://remotion.dev/docs/renderer/extract-audio)
 * @param options.videoSource The path to the video source from which the audio will be extracted.
 * @param options.audioOutput The path where the extracted audio will be saved. Must use the correct file extension which matches the audio codec.
 * @param options.logLevel The level of logging desired (optional).
 * @param options.binariesDirectory The directory for binary dependencies (optional).
 * @returns {Promise<void>} Resolves once the audio extraction is complete.
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
	});
	await compositor.executeCommand('ExtractAudio', {
		input_path: options.videoSource,
		output_path: options.audioOutput,
	});
	await compositor.finishCommands();
	await compositor.waitForDone();
};
