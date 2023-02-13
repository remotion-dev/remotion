const isErrorLink = (err: unknown) => {
	return (
		typeof err === 'object' &&
		err !== null &&
		'stack' in err &&
		typeof err.stack === 'string' &&
		'message' in err &&
		typeof err.message === 'string'
	);
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
