import type {LogLevel} from '../log';
import {Log} from '../log';

export const eventLoopState = (logLevel: LogLevel) => {
	let lastEventLoopBreak = Date.now();

	const eventLoopBreakIfNeeded = async () => {
		if (Date.now() - lastEventLoopBreak > 2_000) {
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 50);
			});
			Log.verbose(logLevel, '10ms event loop break');
			lastEventLoopBreak = Date.now();
		}
	};

	return {eventLoopBreakIfNeeded};
};
