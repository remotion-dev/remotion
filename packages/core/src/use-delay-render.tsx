import {createContext, useCallback, useContext} from 'react';
import type {cancelRender as cancelRenderOriginal} from './cancel-render.js';
import {cancelRenderInternal} from './cancel-render.js';
import type {DelayRenderOptions, DelayRenderScope} from './delay-render.js';
import {continueRenderInternal, delayRenderInternal} from './delay-render.js';
import {useLogger} from './use-logger.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

type DelayRenderFn = (label?: string, options?: DelayRenderOptions) => number;
type ContinueRenderFn = (handle: number) => void;
type CancelRenderFn = typeof cancelRenderOriginal;

export const DelayRenderContextType = createContext<DelayRenderScope | null>(
	null,
);

export const useDelayRender = (): {
	delayRender: DelayRenderFn;
	continueRender: ContinueRenderFn;
	cancelRender: CancelRenderFn;
} => {
	const environment = useRemotionEnvironment();
	const scope =
		useContext(DelayRenderContextType) ??
		(typeof window !== 'undefined' ? window : undefined);
	const logger = useLogger();

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
		// The logger has stable identity and reads the latest context.
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				logger,
			});
		},
		[environment, scope],
	);

	const cancelRender = useCallback<CancelRenderFn>(
		(err: unknown) => {
			return cancelRenderInternal(
				scope ?? (typeof window !== 'undefined' ? window : undefined),
				err,
			);
		},
		[scope],
	);

	return {delayRender, continueRender, cancelRender};
};
