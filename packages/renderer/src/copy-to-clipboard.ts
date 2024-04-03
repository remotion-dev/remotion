import {startLongRunningCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';

export const copyImageToClipboard = async (
	src: string,
	logLevel: LogLevel,
	binariesDirectory: string | null,
) => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel,
		indent: false,
		binariesDirectory,
	});

	await compositor.executeCommand('CopyImageToClipboard', {
		src,
	});

	await compositor.finishCommands();
	await compositor.waitForDone();
};
