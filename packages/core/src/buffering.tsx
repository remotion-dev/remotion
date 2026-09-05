import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {useLogging} from './log-level-context';
import {playbackLogging} from './playback-logging';
import {SetTimelineContext} from './TimelineContext.js';
import {useRemotionEnvironment} from './use-remotion-environment';

type BufferManager = {
	addBlock: () => {unblock: () => void};
};

const useBufferManager = (
	setBuffering: (buffering: boolean) => void,
	isBuffering: () => boolean,
): BufferManager => {
	const [blockCount, setBlockCount] = useState(0);

	const env = useRemotionEnvironment();
	const logging = useLogging();
	const loggingRef = React.useRef(logging);
	loggingRef.current = logging;
	const rendering = env.isRendering;

	const addBlock = useCallback(() => {
		if (rendering) {
			return {
				unblock: () => undefined,
			};
		}

		let unblocked = false;

		setBlockCount((count) => count + 1);
		return {
			unblock: () => {
				if (unblocked) {
					return;
				}

				unblocked = true;
				setBlockCount((count) => count - 1);
			},
		};
	}, [rendering]);

	useEffect(() => {
		if (rendering) {
			return;
		}

		// Only fire on the `false -> true` transition: adding a block while
		// already buffering (e.g. a second media element starts loading) must
		// not re-dispatch `waiting` to listeners.
		if (blockCount > 0 && !isBuffering()) {
			setBuffering(true);
			playbackLogging({
				...loggingRef.current,
				message: 'Player is entering buffer state',
				tag: 'player',
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blockCount]);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (rendering) {
				return;
			}

			// Only fire on the `true -> false` transition: the initial mount and
			// a block that was added and removed within the same commit must not
			// dispatch `resume` to listeners.
			if (blockCount === 0 && isBuffering()) {
				setBuffering(false);
				playbackLogging({
					...loggingRef.current,
					message: 'Player is exiting buffer state',
					tag: 'player',
				});
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [blockCount]);
	}

	return useMemo(() => ({addBlock}), [addBlock]);
};

export const BufferingContextReact = React.createContext<BufferManager | null>(
	null,
);

export const BufferingProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {isBuffering, setBuffering} = React.useContext(SetTimelineContext);
	const bufferManager = useBufferManager(setBuffering, isBuffering);

	return (
		<BufferingContextReact.Provider value={bufferManager}>
			{children}
		</BufferingContextReact.Provider>
	);
};
