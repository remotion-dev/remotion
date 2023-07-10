import {useCallback, useState} from 'react';
import {delayRender, continueRender} from './delay-render.js';

type ContinueRenderFnBinded = () => void;

/**
 * @description Same as delayRender(), but as a hook.
 * @see [Documentation](https://remotion.dev/docs/use-delay-render)
 */
export const useDelayRender = (label?: string): ContinueRenderFnBinded => {
	const [handle] = useState(() => delayRender(label));
	return useCallback(() => {
		continueRender(handle);
	}, [handle]);
};
