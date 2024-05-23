import {startLongRunningCompositor} from './compositor/compositor';
import type {VideoMetadata} from './compositor/payloads';
import type {LogLevel} from './log-level';

export {VideoMetadata} from './compositor/payloads';

export const getVideoMetadata = async (
	videoSource: string,
	options?: {logLevel?: LogLevel; binariesDirectory?: string | null},
): Promise<VideoMetadata> => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: options?.logLevel ?? 'info',
		indent: false,
		binariesDirectory: options?.binariesDirectory ?? null,
	});
	const metadataResponse = await compositor.executeCommand('GetVideoMetadata', {
		src: videoSource,
	});
	await compositor.finishCommands();
	await compositor.waitForDone();
	return JSON.parse(
		new TextDecoder('utf-8').decode(metadataResponse),
	) as VideoMetadata;
};
