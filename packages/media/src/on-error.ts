import {Internals, type MediaErrorHandler} from 'remotion';
export type MediaErrorEvent = {
	error: Error;
};

export type MediaErrorAction = 'fallback' | 'fail';
export type MediaOnError = MediaErrorHandler<MediaErrorAction | 'handled'>;

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
}): Promise<[MediaErrorAction | 'handled', Error]> => {
	const result = await Internals.resolveMediaError<
		MediaErrorAction | 'handled'
	>({
		onError,
		error,
		defaultAction: disallowFallback ? 'fail' : 'fallback',
		actions: ['fallback', 'fail', 'handled'],
	});
	if (result.action === 'handled' || result.isHandlerError)
		return [result.action, result.error];

	if (isClientSideRendering) {
		if (clientSideError !== error) clientSideError.cause = error;
		return ['fail', clientSideError];
	}

	return [result.action, result.error];
};
