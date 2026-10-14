import {
	cancelRenderFromAsync,
	resolveMediaError,
	type MediaErrorHandler,
} from './media-error-handler.js';

export const handleImageError = async ({
	error,
	onError,
	isCancelled,
	cancelRender,
	onHandled,
}: {
	error: Error;
	onError: MediaErrorHandler<'handled' | 'fail' | 'wait'> | undefined;
	isCancelled: () => boolean;
	cancelRender: (error: unknown) => never;
	onHandled: () => void;
}): Promise<void> => {
	if (isCancelled()) return;
	const result = await resolveMediaError({
		error,
		onError,
		defaultAction: onError ? 'handled' : 'fail',
	});
	if (isCancelled()) return;
	if (result.action === 'fail') {
		cancelRenderFromAsync(cancelRender, result.error);
	} else if (result.action === 'handled') {
		onHandled();
	}
};
