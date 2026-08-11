import {resolve} from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {startLongRunningCompositor} from './compositor/compositor';
import type {VideoMetadata} from './compositor/payloads';
import type {LogLevel} from './log-level';

export {VideoMetadata} from './compositor/payloads';

/**
 * @deprecated Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny/metadata
 */
export const getVideoMetadata = async (
	videoSource: string,
	options?: {logLevel?: LogLevel; binariesDirectory?: string | null},
): Promise<VideoMetadata> => {
	if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
		throw new Error(
			'getVideoMetadata() has been removed in Remotion 5. Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny/metadata',
		);
	}

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
