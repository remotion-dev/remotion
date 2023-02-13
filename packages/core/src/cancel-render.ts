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
	if (isErrorLink(err)) {
		throw err;
	}

	if (typeof err === 'string') {
		throw new Error(err);
	}

	throw new Error('Rendering was cancelled');
}
