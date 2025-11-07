import {createContext, useCallback, useContext} from 'react';
import type {DelayRenderOptions, DelayRenderScope} from './delay-render.js';
import {continueRenderInternal, delayRenderInternal} from './delay-render.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

type DelayRenderFn = (label?: string, options?: DelayRenderOptions) => number;
type ContinueRenderFn = (handle: number) => void;

export const DelayRenderContextType = createContext<DelayRenderScope | null>(
	null,
);

export const useDelayRender = (): {
	delayRender: DelayRenderFn;
	continueRender: ContinueRenderFn;
} => {
	const environment = useRemotionEnvironment();
	const scope = useContext(DelayRenderContextType);

	const delayRender = useCallback<DelayRenderFn>(
		(label?: string, options?: DelayRenderOptions) => {
			return delayRenderInternal(
				scope ?? (typeof window !== 'undefined' ? window : undefined),
				environment,
				label,
				options,
			);
		},
		[environment, scope],
	);

	const continueRender = useCallback<ContinueRenderFn>(
		(handle: number) => {
			continueRenderInternal(
				scope ?? (typeof window !== 'undefined' ? window : undefined),
				handle,
				environment,
			);
		},
		[environment, scope],
	);

	return {delayRender, continueRender};
};
