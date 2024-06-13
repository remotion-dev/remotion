import {useContext, useMemo} from 'react';
import {BufferingContextReact} from './buffering';

export const useBufferState = () => {
	const buffer = useContext(BufferingContextReact);

	if (!buffer) {
		throw new Error(
			'Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state',
		);
	}

	const {addBlock} = buffer;

	return useMemo(
		() => ({
			delayPlayback: () => {
				const {unblock} = addBlock({
					id: String(Math.random()),
				});

				return {unblock};
			},
		}),
		[addBlock],
	);
};
