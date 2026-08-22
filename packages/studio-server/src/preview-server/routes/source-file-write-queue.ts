import {AsyncLocalStorage} from 'node:async_hooks';
import type {LogLevel} from '@remotion/renderer';

let chain: Promise<unknown> = Promise.resolve();
const codemodStartTime = new AsyncLocalStorage<number>();

export const getCodemodTimingPrefix = (logLevel: LogLevel) => {
	const startTime = codemodStartTime.getStore();
	return logLevel === 'trace' && startTime !== undefined
		? `[${Date.now() - startTime}ms] `
		: '';
};

export const withSourceFileWriteQueue = <T>(
	fn: () => Promise<T>,
): Promise<T> => {
	const run = () => codemodStartTime.run(Date.now(), fn);
	const next = chain.then(run, run);

	chain = next.then(
		() => undefined,
		() => undefined,
	);
	return next;
};
