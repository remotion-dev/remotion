const isErrorLike = (err: unknown): boolean => {
	if (err instanceof Error) {
		return true;
	}

	if (err === null) {
		return false;
	}

	if (typeof err !== 'object') {
		return false;
	}

	if (!('stack' in err)) {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
	// @ts-ignore we just asserted
	if (typeof err.stack !== 'string') {
		return false;
	}

	if (!('message' in err)) {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
	// @ts-ignore we just asserted
	if (typeof err.message !== 'string') {
		return false;
	}

	return true;
};

/*
 * @description When you invoke this function, Remotion will stop rendering all the frames without any retries.
 * @see [Documentation](https://remotion.dev/docs/cancel-render)
 */
export function cancelRender(err: unknown): never {
	let error: Error;

	if (isErrorLike(err)) {
		error = err as Error;
		if (!error.stack) {
			error.stack = new Error(error.message).stack;
		}
	} else if (typeof err === 'string') {
		error = Error(err);
	} else {
		error = Error('Rendering was cancelled');
	}

	window.remotion_cancelledError = error.stack;
	throw error;
}
