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

	if (result) {
		return [result, error];
	}

	if (disallowFallback) {
		return ['fail', error];
	}

	return ['fallback', error];
};
