import {
	startLongRunningCompositor,
	getIdealMaximumFrameCacheItems,
} from './compositor/compositor';
import type {VideoMetadata} from './compositor/payloads';

export const getVideoMetadata = async (
	videoSource: string
): Promise<VideoMetadata> => {
	const compositor = startLongRunningCompositor(
		getIdealMaximumFrameCacheItems(),
		'info',
		false
	);
	const metadataResponse = await compositor.executeCommand('GetVideoMetadata', {
		src: videoSource,
	});
	compositor.finishCommands();
	await compositor.waitForDone();
	return JSON.parse(metadataResponse.toString('utf-8')) as VideoMetadata;
};
