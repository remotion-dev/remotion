import {useCallback, useLayoutEffect, useState} from 'react';

/** A handled failure is intentionally replaced or omitted by the application. */
// Keep the void callback arm: existing logging callbacks may return an event ID or count.
export type MediaErrorHandler<Action extends string = 'handled' | 'fail'> =
	| ((error: Error) => Action | void | Promise<Action | void>)
	| ((error: Error) => void);

// Shared by image loaders and @remotion/media. The caller owns the render hold
// and checks whether the source is still current after awaiting the decision.
export const resolveMediaError = async <Action extends string>({
	onError,
	error,
	defaultAction,
	actions,
}: {
	onError: MediaErrorHandler<Action> | undefined;
	error: Error;
	defaultAction: Action;
	actions: readonly Action[];
}): Promise<{
	action: Action | 'fail';
	error: Error;
	isDefaultAction: boolean;
	isHandlerError: boolean;
}> => {
	try {
		const returnedValue = await onError?.(error);
		const action = actions.find((candidate) => candidate === returnedValue);
		return {
			action: action ?? defaultAction,
			error,
			isDefaultAction: action === undefined,
			isHandlerError: false,
		};
	} catch (cause) {
		return {
			action: 'fail',
			isDefaultAction: false,
			isHandlerError: true,
			error: cause instanceof Error ? cause : new Error(String(cause), {cause}),
		};
	}
};

// Event handlers and promise catches cannot propagate cancelRender's intentional
// throw to the render caller. It has already recorded the failure in the scope.
export const cancelRenderFromAsync = (
	cancelRender: (error: unknown) => never,
	error: Error,
): void => {
	try {
		cancelRender(error);
	} catch (thrown) {
		if (thrown !== error) throw thrown;
	}
};

// Preserve legacy void-handler behavior by releasing after a commit. Explicit
// handled decisions instead keep the hold until the source effect cleans up,
// including when a replacement transition suspends.
export const useErrorRecoveryCommit = () => {
	const [callbacks, setCallbacks] = useState<Array<() => void>>([]);
	useLayoutEffect(() => {
		if (callbacks.length === 0) return;
		for (const callback of callbacks) callback();
		setCallbacks([]);
	}, [callbacks]);
	return useCallback((callback: () => void) => {
		setCallbacks((current) => [...current, callback]);
	}, []);
};
