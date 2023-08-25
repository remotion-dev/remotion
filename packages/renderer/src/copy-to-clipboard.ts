import {
	getIdealMaximumFrameCacheSizeInBytes,
	startLongRunningCompositor,
} from './compositor/compositor';
import type {LogLevel} from './log-level';

export const copyImageToClipboard = async (src: string, logLevel: LogLevel) => {
	const compositor = startLongRunningCompositor(
		getIdealMaximumFrameCacheSizeInBytes(),
		logLevel,
		false,
	);

	await compositor.executeCommand('CopyImageToClipboard', {
		src,
	});

	compositor.finishCommands();
	await compositor.waitForDone();
};
