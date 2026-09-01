import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {useLogger} from './use-logger.js';
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

const useBufferManager = (): BufferManager => {
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [onBufferingCallbacks, setOnBufferingCallbacks] = useState<
		OnBufferingCallback[]
	>([]);
	const [onResumeCallbacks, setOnResumeCallbacks] = useState<
		OnBufferingCallback[]
	>([]);

	const env = useRemotionEnvironment();
	const logger = useLogger();
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
			setOnBufferingCallbacks((c) => [...c, callback]);

			return {
				remove: () => {
					setOnBufferingCallbacks((c) => c.filter((cb) => cb !== callback));
				},
			};
		},
		[],
	);

	const listenForResume: ListenForResume = useCallback(
		(callback: OnResumeCallback) => {
			setOnResumeCallbacks((c) => [...c, callback]);

			return {
				remove: () => {
					setOnResumeCallbacks((c) => c.filter((cb) => cb !== callback));
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
			onBufferingCallbacks.forEach((c) => c());
			logger.playback('player', 'Player is entering buffer state');
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
				onResumeCallbacks.forEach((c) => c());
				logger.playback('player', 'Player is exiting buffer state');
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
	const bufferManager = useBufferManager();

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
