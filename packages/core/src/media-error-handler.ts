import {useCallback, useLayoutEffect, useState} from 'react';

/** A handled failure is intentionally replaced or omitted by the application. */
export type MediaErrorHandler<Action extends string = 'handled' | 'fail'> = (
	error: Error,
) => Action | void | Promise<Action | void>;

// Shared by image loaders and @remotion/media. The caller owns the render hold
// and checks whether the source is still current after awaiting the decision.
export const resolveMediaError = async <Action extends string>({
	onError,
	error,
	defaultAction,
}: {
	onError: MediaErrorHandler<Action> | undefined;
	error: Error;
	defaultAction: Action;
}): Promise<{action: Action | 'fail'; error: Error}> => {
	try {
		const action = await onError?.(error);
		return {action: action ?? defaultAction, error};
	} catch (cause) {
		return {
			action: 'fail',
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

// A handler may set the replacement source immediately before resolving. Let
// React commit that source (and its own loading hold) before releasing the old
// hold. The caller must recheck its source lifetime in the callback.
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
