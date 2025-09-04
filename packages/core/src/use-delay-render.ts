import {useCallback} from 'react';
import type {DelayRenderOptions} from './delay-render.js';
import {continueRenderInternal, delayRenderInternal} from './delay-render.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

type DelayRenderFn = (label?: string, options?: DelayRenderOptions) => number;
type ContinueRenderFn = (handle: number) => void;

export const useDelayRender = (): {
	delayRender: DelayRenderFn;
	continueRender: ContinueRenderFn;
} => {
	const environment = useRemotionEnvironment();

	const delayRender = useCallback<DelayRenderFn>(
		(label?: string, options?: DelayRenderOptions) => {
			return delayRenderInternal(environment, label, options);
		},
		[environment],
	);

	const continueRender = useCallback<ContinueRenderFn>(
		(handle: number) => {
			continueRenderInternal(handle, environment);
		},
		[environment],
	);

	return {delayRender, continueRender};
};
