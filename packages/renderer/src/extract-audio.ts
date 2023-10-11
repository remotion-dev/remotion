import {startLongRunningCompositor} from './compositor/compositor';
import type {VideoMetadata} from './compositor/payloads';
import type {LogLevel} from './log-level';

export const extractAudio = async (options: {
	videoSource: string;
	audioOutput: string;
	logLevel?: LogLevel;
}): Promise<VideoMetadata> => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: options?.logLevel ?? 'info',
		indent: false,
	});
	const metadataResponse = await compositor.executeCommand('ExtractAudio', {
		input_path: options.videoSource,
		output_path: options.audioOutput,
	});
	compositor.finishCommands();
	await compositor.waitForDone();
	return JSON.parse(metadataResponse.toString('utf-8')) as VideoMetadata;
};
