import {Internals, type MediaErrorHandler} from 'remotion';
export type MediaErrorEvent = {
	error: Error;
};

export type MediaErrorAction = 'fallback' | 'fail' | 'handled';
export type MediaOnError = MediaErrorHandler<MediaErrorAction>;

export const callOnErrorAndResolve = async ({
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
}): Promise<[MediaErrorAction, Error]> => {
	const result = await Internals.resolveMediaError<MediaErrorAction>({
		onError,
		error,
		defaultAction: disallowFallback ? 'fail' : 'fallback',
	});
	if (result.action === 'handled' || result.action === 'fail')
		return [result.action, result.error];

	if (isClientSideRendering) {
		if (clientSideError !== error) clientSideError.cause = error;
		return ['fail', clientSideError];
	}

	return ['fallback', result.error];
};
