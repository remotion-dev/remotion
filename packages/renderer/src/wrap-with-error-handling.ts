import {printUsefulErrorMessage} from './print-useful-error-message';

type AsyncFunction<A extends unknown[], R> = (...args: A) => Promise<R>;

export const wrapWithErrorHandling = <A extends unknown[], R>(
	fn: AsyncFunction<A, R>,
): AsyncFunction<A, R> => {
	return async (...args: A): Promise<R> => {
		try {
			return await fn(...args);
		} catch (err) {
			printUsefulErrorMessage(err as Error, 'info');
			throw err;
		}
	};
};
