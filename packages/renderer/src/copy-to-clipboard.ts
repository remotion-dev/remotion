import {startLongRunningCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';

export const copyImageToClipboard = async (src: string, logLevel: LogLevel) => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel,
		indent: false,
	});

	await compositor.executeCommand('CopyImageToClipboard', {
		src,
	});

	await compositor.finishCommands();
	await compositor.waitForDone();
};
