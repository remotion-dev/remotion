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
	onError: MediaErrorHandler | undefined;
	isCancelled: () => boolean;
	cancelRender: (error: unknown) => never;
	onHandled: (() => void) | null;
}): Promise<void> => {
	if (isCancelled()) return;
	const result = await resolveMediaError({
		error,
		onError,
		defaultAction: onError ? 'handled' : 'fail',
		actions: ['handled', 'fail'],
	});
	if (isCancelled()) return;
	// Explicit recovery completes when the source is replaced or unmounted.
	// Its existing effect cleanup releases the hold at that commit.
	if (result.action === 'fail') {
		cancelRenderFromAsync(cancelRender, result.error);
	} else if (result.action === 'handled' && result.isDefaultAction) {
		onHandled?.();
	}
};
