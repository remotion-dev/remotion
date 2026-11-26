import {createContext, useCallback, useContext} from 'react';
import type {cancelRender} from './cancel-render.js';
import {
	cancelRenderInternal,
	reportRenderErrorInternal,
} from './cancel-render.js';
import type {DelayRenderOptions, DelayRenderScope} from './delay-render.js';
import {continueRenderInternal, delayRenderInternal} from './delay-render.js';
import {useLogLevel} from './log-level-context.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

type DelayRenderFn = (label?: string, options?: DelayRenderOptions) => number;
type ContinueRenderFn = (handle: number) => void;
export const CancelRenderContext = createContext<
	((error: Error) => void) | null
>(null);

export const DelayRenderContextType = createContext<DelayRenderScope | null>(
	null,
);

export const useDelayRender = (): {
	delayRender: DelayRenderFn;
	continueRender: ContinueRenderFn;
	cancelRender: typeof cancelRender;
} => {
	const environment = useRemotionEnvironment();
	const cancellationOwner = useContext(CancelRenderContext);
	const scope =
		useContext(DelayRenderContextType) ??
		(typeof window !== 'undefined' ? window : undefined);
	const logLevel = useLogLevel();

	const delayRender = useCallback<DelayRenderFn>(
		(label?: string, options?: DelayRenderOptions) => {
			if (!scope) {
				return Math.random();
			}

			return delayRenderInternal({
				scope,
				environment,
				label: label ?? null,
				options: options ?? {},
			});
		},
		[environment, scope],
	);

	const continueRender = useCallback<ContinueRenderFn>(
		(handle: number) => {
			if (!scope) {
				return;
			}

			continueRenderInternal({
				scope,
				handle,
				environment,
				logLevel,
			});
		},
		[environment, logLevel, scope],
	);

	const scopedCancelRender = useCallback<typeof cancelRender>(
		(err: unknown) => {
			return cancelRenderInternal(
				scope ?? (typeof window !== 'undefined' ? window : undefined),
				err,
				cancellationOwner,
			);
		},
		[scope, cancellationOwner],
	);

	return {delayRender, continueRender, cancelRender: scopedCancelRender};
};

// Internal: only terminal runtime-owned async work may use a returning reporter.
export const useReportRenderError = (): ((error: unknown) => void) => {
	const cancellationOwner = useContext(CancelRenderContext);
	const scope =
		useContext(DelayRenderContextType) ??
		(typeof window !== 'undefined' ? window : undefined);
	return useCallback(
		(error: unknown) => {
			reportRenderErrorInternal(scope, error, cancellationOwner);
		},
		[scope, cancellationOwner],
	);
};
