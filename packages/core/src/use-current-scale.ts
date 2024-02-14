import React from 'react';

export const CurrentScaleContext = React.createContext<number | null>(null);

type Options = {
	dontThrowIfOutsideOfRemotion: boolean;
};

/**
 * Gets the current scale of the container in which the component is being rendered.
 * Only works in the Remotion Studio and in the Remotion Player.
 */
export const useCurrentScale = (options?: Options) => {
	const scale = React.useContext(CurrentScaleContext);
	const timelineZoomCtx = React.useContext(TimelineZoomCtx);

	if (scale === null) {
		if (options?.dontThrowIfOutsideOfRemotion) {
			return 1;
		}

		throw new Error(
			[
				'useCurrentScale() was called outside of a Remotion context.',
				'This hook can only be called in a component that is being rendered by Remotion.',
				'If you want to this hook to return 1 outside of Remotion, pass {dontThrowIfOutsideOfRemotion: true} as an option.',
				'If you think you called this hook in a Remotion component, make sure all versions of Remotion are aligned.',
			].join('\n'),
		);
	}

	return scale;
};
