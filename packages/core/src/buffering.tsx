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
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [onBufferingCallbacks, setOnBufferingCallbacks] = useState<
		OnBufferingCallback[]
	>([]);
	const [onResumeCallbacks, setOnResumeCallbacks] = useState<
		OnBufferingCallback[]
	>([]);

	const buffering = useRef(false);

	const addBlock: AddBlock = useCallback((block: Block) => {
		setBlocks((b) => [...b, block]);
		return {
			unblock: () => {
				setBlocks((b) => {
					const newArr = b.filter((bx) => bx !== block);
					if (newArr.length === b.length) {
						return b;
					}

					return newArr;
				});
			},
		};
	}, []);

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
		if (blocks.length > 0) {
			onBufferingCallbacks.forEach((c) => c());
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

	useEffect(() => {
		if (blocks.length === 0) {
			onResumeCallbacks.forEach((c) => c());
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

		bufferManager.listenForBuffering(onBuffer);
		bufferManager.listenForResume(onResume);

		return () => {
			bufferManager.listenForBuffering(() => undefined);
			bufferManager.listenForResume(() => undefined);
		};
	}, [bufferManager]);

	return isBuffering;
};
