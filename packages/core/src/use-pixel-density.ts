import React, {useContext} from 'react';
import {CanUseRemotionHooks} from './CanUseRemotionHooks.js';

type Options = {
	dontThrowIfOutsideOfRemotion?: boolean;
};

export const PixelDensityContext = React.createContext<number | null>(null);

const getBrowserPixelDensity = () => {
	if (typeof window === 'undefined') {
		return 1;
	}

	return window.devicePixelRatio || 1;
};

/*
 * @description Retrieves the current pixel density. In previews, this corresponds to `window.devicePixelRatio`. During renders, this corresponds to the `scale` option.
 * @see [Documentation](https://www.remotion.dev/docs/use-pixel-density)
 */
export const usePixelDensity = (options?: Options): number => {
	const pixelDensity = useContext(PixelDensityContext);
	const canUseRemotionHooks = useContext(CanUseRemotionHooks);

	if (pixelDensity !== null) {
		return pixelDensity;
	}

	if (canUseRemotionHooks || options?.dontThrowIfOutsideOfRemotion) {
		return getBrowserPixelDensity();
	}

	throw new Error(
		[
			'usePixelDensity() was called outside of a Remotion context.',
			'This hook can only be called in a component that is being rendered by Remotion.',
			'If you want this hook to return the browser pixel density outside of Remotion, pass {dontThrowIfOutsideOfRemotion: true} as an option.',
			'If you think you called this hook in a Remotion component, make sure all versions of Remotion are aligned.',
		].join('\n'),
	);
};
