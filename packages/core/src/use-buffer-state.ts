import {useContext, useMemo} from 'react';
import {BufferingContextReact} from './buffering';
import {CanUseRemotionHooks} from './CanUseRemotionHooks';

export const useBufferState = () => {
	const canUseRemotionHooks = useContext(CanUseRemotionHooks);

	if (!canUseRemotionHooks) {
		if (typeof window !== 'undefined' && window.remotion_isPlayer) {
			throw new Error(
				`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`,
			);
		}

		throw new Error(
			`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`,
		);
	}

	const buffer = useContext(BufferingContextReact);
	if (!buffer) {
		throw new Error(
			'BufferingContextReact was unexpectedly not found. Most likely your Remotion versions are mismatching.',
		);
	}

	return useMemo(
		() => ({
			delayPlayback: () => {
				const {unblock} = buffer.addBlock({
					id: String(Math.random()),
				});

				return {unblock};
			},
		}),
		[buffer],
	);
};
