import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {LogLevel} from './log';
import {LogLevelContext} from './log-level-context';
import {playbackLogging} from './playback-logging';
import {useRemotionEnvironment} from './use-remotion-environment';

type Block = {
	id: string;
};

type OnBufferingCallback = () => void;
type OnResumeCallback = () => void;

type ListenForBuffering = (callback: OnBufferingCallback) => {
	remove: () => void;
};

type ListenForResume = (callback: OnResumeCallback) => {
	remove: () => void;
};

type AddBlock = (block: Block) => {
	unblock: () => void;
};

type BufferManager = {
	addBlock: AddBlock;
	listenForBuffering: ListenForBuffering;
	listenForResume: ListenForResume;
	buffering: React.MutableRefObject<boolean>;
};

const useBufferManager = (
	logLevel: LogLevel,
	mountTime: number | null,
): BufferManager => {
	const blocks = useRef<Block[]>([]);
	const onBufferingCallbacks = useRef<OnBufferingCallback[]>([]);
	const onResumeCallbacks = useRef<OnResumeCallback[]>([]);

	const env = useRemotionEnvironment();
	const rendering = env.isRendering;

	const buffering = useRef(false);

	// Fire callbacks only on the `0 <-> >0` blocks transition.
	// `buffering` holds the last reported state, so intermediate changes
	// (e.g. 2 -> 3 blocks) are no-ops and never re-notify listeners.
	const checkBuffering = useCallback(() => {
		if (rendering) {
			return;
		}

		const isBuffering = blocks.current.length > 0;
		if (isBuffering === buffering.current) {
			return;
		}

		buffering.current = isBuffering;

		if (isBuffering) {
			// Iterate a copy: a callback may remove itself while being called.
			[...onBufferingCallbacks.current].forEach((c) => c());
			playbackLogging({
				logLevel,
				message: 'Player is entering buffer state',
				mountTime,
				tag: 'player',
			});
		} else {
			[...onResumeCallbacks.current].forEach((c) => c());
			playbackLogging({
				logLevel,
				message: 'Player is exiting buffer state',
				mountTime,
				tag: 'player',
			});
		}
	}, [logLevel, mountTime, rendering]);

	const addBlock: AddBlock = useCallback(
		(block: Block) => {
			if (rendering) {
				return {
					unblock: () => undefined,
				};
			}

			let unblocked = false;

			blocks.current.push(block);
			checkBuffering();
			return {
				unblock: () => {
					if (unblocked) {
						return;
					}

					unblocked = true;
					blocks.current = blocks.current.filter((bx) => bx !== block);
					checkBuffering();
				},
			};
		},
		[checkBuffering, rendering],
	);

	const listenForBuffering: ListenForBuffering = useCallback(
		(callback: OnBufferingCallback) => {
			onBufferingCallbacks.current.push(callback);

			return {
				remove: () => {
					onBufferingCallbacks.current = onBufferingCallbacks.current.filter(
						(cb) => cb !== callback,
					);
				},
			};
		},
		[],
	);

	const listenForResume: ListenForResume = useCallback(
		(callback: OnResumeCallback) => {
			onResumeCallbacks.current.push(callback);

			return {
				remove: () => {
					onResumeCallbacks.current = onResumeCallbacks.current.filter(
						(cb) => cb !== callback,
					);
				},
			};
		},
		[],
	);

	return useMemo(() => {
		return {addBlock, listenForBuffering, listenForResume, buffering};
	}, [addBlock, buffering, listenForBuffering, listenForResume]);
};

export const BufferingContextReact = React.createContext<BufferManager | null>(
	null,
);

export const BufferingProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {logLevel, mountTime} = useContext(LogLevelContext);
	const bufferManager = useBufferManager(logLevel ?? 'info', mountTime);

	return (
		<BufferingContextReact.Provider value={bufferManager}>
			{children}
		</BufferingContextReact.Provider>
	);
};

export const useIsPlayerBuffering = (bufferManager: BufferManager) => {
	const [isBuffering, setIsBuffering] = useState(
		bufferManager.buffering.current,
	);

	useEffect(() => {
		const onBuffer = () => {
			setIsBuffering(true);
		};

		const onResume = () => {
			setIsBuffering(false);
		};

		const buffer = bufferManager.listenForBuffering(onBuffer);
		const resume = bufferManager.listenForResume(onResume);

		// Sync in case the buffer state flipped between the initial render and
		// this subscription (e.g. a media element blocked before we listened).
		setIsBuffering(bufferManager.buffering.current);

		return () => {
			buffer.remove();
			resume.remove();
		};
	}, [bufferManager]);

	return isBuffering;
};
