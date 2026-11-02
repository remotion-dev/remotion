export type MediaErrorEvent = {
	error: Error;
};

export type MediaErrorAction = 'fallback' | 'fail';
export type MediaOnError = (error: Error) => MediaErrorAction | undefined;

export const callOnErrorAndResolve = ({
	onError,
	error,
	disallowFallback,
	isClientSideRendering,
	clientSideError,
}: {
	onError: MediaOnError | undefined;
	error: Error;
	clientSideError: Error;
	disallowFallback: boolean;
	isClientSideRendering: boolean;
}): [MediaErrorAction, Error] => {
	const result = onError?.(error);

	if (isClientSideRendering) {
		return ['fail', clientSideError];
	}

	// Only recognized actions override the default. Callbacks may return other
	// values in JavaScript, such as a Promise from an async logging function.
	if (result === 'fail' || result === 'fallback') {
		return [result, error];
	}

	if (disallowFallback) {
		return ['fail', error];
	}

	return ['fallback', error];
};
