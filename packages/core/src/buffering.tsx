import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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

const useBufferManager = (): BufferManager => {
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
		}

		// Intentionally only firing when blocks change, not the callbacks
		// otherwise a buffering callback might remove itself after being called
		// and trigger again

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blocks]);

	useEffect(() => {
		if (blocks.length === 0) {
			onResumeCallbacks.forEach((c) => c());
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
	const bufferManager = useBufferManager();

	return (
		<BufferingContextReact.Provider value={bufferManager}>
			{children}
		</BufferingContextReact.Provider>
	);
};
