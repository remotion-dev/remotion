import {useContext, useMemo, useRef} from 'react';
import {BufferingContextReact} from './buffering';
import {Log} from './log';
import {useLogging} from './log-level-context';

export type DelayPlaybackHandle = {
	unblock: () => void;
};

export type UseBufferState = {
	delayPlayback: () => DelayPlaybackHandle;
};

export const useBufferState = (): UseBufferState => {
	const buffer = useContext(BufferingContextReact);
	const logging = useLogging();
	const loggingRef = useRef(logging);
	loggingRef.current = logging;

	// Allows <Img> tag to be rendered without a context
	// https://github.com/remotion-dev/remotion/issues/4007
	const addBlock = buffer ? buffer.addBlock : null;

	return useMemo(
		() => ({
			delayPlayback: () => {
				if (!addBlock) {
					throw new Error(
						'Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state',
					);
				}

				Log.trace(
					{logLevel: loggingRef.current.logLevel, tag: '[buffer-state]'},
					'Adding buffer handle',
					new Error().stack,
				);

				const {unblock} = addBlock();

				let unblocked = false;

				return {
					unblock: () => {
						if (unblocked) {
							return;
						}

						unblocked = true;
						Log.trace(
							{logLevel: loggingRef.current.logLevel, tag: '[buffer-state]'},
							'Removing buffer handle',
						);
						unblock();
					},
				};
			},
		}),
		[addBlock],
	);
};
