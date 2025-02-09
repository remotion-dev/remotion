import {resolve} from 'node:path';
import {startLongRunningCompositor} from './compositor/compositor';
import type {VideoMetadata} from './compositor/payloads';
import type {LogLevel} from './log-level';

export {VideoMetadata} from './compositor/payloads';

/**
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/media-parser/parse-media
 */
export const getVideoMetadata = async (
	videoSource: string,
	options?: {logLevel?: LogLevel; binariesDirectory?: string | null},
): Promise<VideoMetadata> => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: options?.logLevel ?? 'info',
		indent: false,
		binariesDirectory: options?.binariesDirectory ?? null,
		extraThreads: 0,
	});
	const metadataResponse = await compositor.executeCommand('GetVideoMetadata', {
		src: resolve(process.cwd(), videoSource),
	});
	await compositor.finishCommands();
	await compositor.waitForDone();
	return JSON.parse(
		new TextDecoder('utf-8').decode(metadataResponse),
	) as VideoMetadata;
};
