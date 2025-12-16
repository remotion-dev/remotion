import {createContext, useCallback, useContext} from 'react';
import type {cancelRender as cancelRenderOriginal} from './cancel-render.js';
import {cancelRenderInternal} from './cancel-render.js';
import type {DelayRenderOptions, DelayRenderScope} from './delay-render.js';
import {continueRenderInternal, delayRenderInternal} from './delay-render.js';
import {useLogLevel} from './log-level-context.js';
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
	const scope = useContext(DelayRenderContextType);
	const logLevel = useLogLevel();

	if (!scope) {
		throw new Error(
			'useDelayRender() was used, but there was no DelayRenderContextProvider.',
		);
	}

	const delayRender = useCallback<DelayRenderFn>(
		(label?: string, options?: DelayRenderOptions) => {
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
			continueRenderInternal({
				scope,
				handle,
				environment,
				logLevel,
			});
		},
		[environment, logLevel, scope],
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
