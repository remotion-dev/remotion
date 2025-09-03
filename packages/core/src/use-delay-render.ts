import {useCallback, useState} from 'react';
import type {DelayRenderOptions} from './delay-render';
import {continueRenderInternal, delayRenderInternal} from './delay-render';
import {useRemotionEnvironment} from './use-remotion-environment';

type ContinueRenderFnBound = () => void;

export const useDelayRender = (
	label?: string,
	options?: DelayRenderOptions,
): ContinueRenderFnBound => {
	const environment = useRemotionEnvironment();
	const [handle] = useState(() =>
		delayRenderInternal(environment, label, options),
	);

	return useCallback(() => {
		continueRenderInternal(handle, environment);
	}, [handle, environment]);
};
