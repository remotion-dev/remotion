import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import type {LogLevel} from './log';
import {LogLevelContext} from './log-level-context';
import {playbackLogging} from './playback-logging';
import {SetTimelineContext} from './TimelineContext.js';
import {useRemotionEnvironment} from './use-remotion-environment';

type BufferManager = {
	addBlock: () => {unblock: () => void};
};

const useBufferManager = (
	logLevel: LogLevel,
	mountTime: number | null,
	setBuffering: (buffering: boolean) => void,
	isBuffering: () => boolean,
): BufferManager => {
	const [blockCount, setBlockCount] = useState(0);

	const env = useRemotionEnvironment();
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
				logLevel,
				message: 'Player is entering buffer state',
				mountTime,
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
					logLevel,
					message: 'Player is exiting buffer state',
					mountTime,
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
	const {logLevel, mountTime} = useContext(LogLevelContext);
	const {isBuffering, setBuffering} = useContext(SetTimelineContext);
	const bufferManager = useBufferManager(
		logLevel ?? 'info',
		mountTime,
		setBuffering,
		isBuffering,
	);

	return (
		<BufferingContextReact.Provider value={bufferManager}>
			{children}
		</BufferingContextReact.Provider>
	);
};
