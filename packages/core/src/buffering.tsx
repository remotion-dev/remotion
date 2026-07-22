import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
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
	buffering: React.RefObject<boolean>;
};

const useBufferManager = (
	logLevel: LogLevel,
	mountTime: number | null,
): BufferManager => {
	const [blocks, setBlocks] = useState<Block[]>([]);
	// Listener registries are refs, not state: `usePlayback` parks its loop
	// during buffering and registers its resume listener from a rAF callback.
	// With state, that registration only lands after the next React commit -
	// if the last block unblocks before then, the resume dispatch reads the
	// previous array, the listener is never called, and the playback loop
	// stays parked forever (frame clock frozen while isPlaying() is true).
	const onBufferingCallbacks = useRef<OnBufferingCallback[]>([]);
	const onResumeCallbacks = useRef<OnBufferingCallback[]>([]);

	const env = useRemotionEnvironment();
	const rendering = env.isRendering;

	const buffering = useRef(false);

	const addBlock: AddBlock = useCallback(
		(block: Block) => {
			if (rendering) {
				return {
					unblock: () => undefined,
				};
			}

			let unblocked = false;

			setBlocks((b) => [...b, block]);
			return {
				unblock: () => {
					if (unblocked) {
						return;
					}

					unblocked = true;
					setBlocks((b) => {
						const newArr = b.filter((bx) => bx !== block);
						if (newArr.length === b.length) {
							return b;
						}

						return newArr;
					});
				},
			};
		},
		[rendering],
	);

	const listenForBuffering: ListenForBuffering = useCallback(
		(callback: OnBufferingCallback) => {
			onBufferingCallbacks.current = [
				...onBufferingCallbacks.current,
				callback,
			];

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
			onResumeCallbacks.current = [...onResumeCallbacks.current, callback];

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

	useEffect(() => {
		if (rendering) {
			return;
		}

		// Only fire on the `false -> true` transition: adding a block while
		// already buffering (e.g. a second media element starts loading) must
		// not re-dispatch `waiting` to listeners.
		if (blocks.length > 0 && !buffering.current) {
			buffering.current = true;
			[...onBufferingCallbacks.current].forEach((c) => c());
			playbackLogging({
				logLevel,
				message: 'Player is entering buffer state',
				mountTime,
				tag: 'player',
			});
		}

		// Intentionally only firing when blocks change, not the callbacks
		// otherwise a buffering callback might remove itself after being called
		// and trigger again

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blocks]);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (rendering) {
				return;
			}

			// Only fire on the `true -> false` transition: the initial mount and
			// a block that was added and removed within the same commit must not
			// dispatch `resume` to listeners.
			if (blocks.length === 0 && buffering.current) {
				buffering.current = false;
				[...onResumeCallbacks.current].forEach((c) => c());
				playbackLogging({
					logLevel,
					message: 'Player is exiting buffer state',
					mountTime,
					tag: 'player',
				});
			}
			// Intentionally only firing when blocks change, not the callbacks
			// otherwise a resume callback might remove itself after being called
			// and trigger again
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [blocks]);
	}

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

		return () => {
			buffer.remove();
			resume.remove();
		};
	}, [bufferManager]);

	return isBuffering;
};
