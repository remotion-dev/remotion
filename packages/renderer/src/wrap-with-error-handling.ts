import type {LogLevel} from './log-level';
import {printUsefulErrorMessage} from './print-useful-error-message';

type AsyncFunction<A extends unknown[], R> = (...args: A) => Promise<R>;

type LogLevelAndIndentApi = {
	logLevel: LogLevel;
	indent: boolean;
};

export const wrapWithErrorHandling = <
	A extends [LogLevelAndIndentApi, ...unknown[]],
	R,
>(
	fn: AsyncFunction<A, R>,
): AsyncFunction<A, R> => {
	return async (...args: A): Promise<R> => {
		try {
			return await fn(...args);
		} catch (err) {
			const {indent} = args[0];
			const {logLevel} = args[0];
			printUsefulErrorMessage(err as Error, logLevel, indent);
			throw err;
		}
	};
};
