import {
	getIdealMaximumFrameCacheItems,
	startLongRunningCompositor,
} from './compositor/compositor';
import type {LogLevel} from './log-level';

export const copyImageToClipboard = async (src: string, logLevel: LogLevel) => {
	const compositor = startLongRunningCompositor(
		getIdealMaximumFrameCacheItems(),
		logLevel ?? 'info',
		false
	);

	await compositor.executeCommand('CopyImageToClipboard', {
		src,
	});

	compositor.finishCommands();
	await compositor.waitForDone();
};
