const isErrorLink = (err: unknown) => {
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
};

export function cancelRender(err: unknown): never {
	let error: Error;

	if (isErrorLink(err)) {
		error = err as Error;
	} else if (typeof err === 'string') {
		error = Error(err);
	} else {
		error = Error('Rendering was cancelled');
	}

	window.remotion_cancelledError = error.stack;
	throw error;
}
