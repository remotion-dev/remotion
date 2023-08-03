import {
	getIdealMaximumFrameCacheItems,
	startLongRunningCompositor,
} from './compositor/compositor';
import type {SilentParts} from './compositor/payloads';

export const getSilentParts = async ({
	src,
}: {
	src: string;
}): Promise<SilentParts[]> => {
	const compositor = startLongRunningCompositor(
		getIdealMaximumFrameCacheItems(),
		'info',
		false
	);

	const res = await compositor.executeCommand('GetSilences', {
		src,
	});
	const response = JSON.parse(res.toString('utf-8')) as SilentParts[];

	compositor.finishCommands();
	await compositor.waitForDone();
	return response;
};
