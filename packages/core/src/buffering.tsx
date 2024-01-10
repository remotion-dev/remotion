import React, {useState} from 'react';

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
	blocks: Block[];
	addBlock: AddBlock;
	listenForBuffering: ListenForBuffering;
	listenForResume: ListenForResume;
};

const createBufferManager = (): BufferManager => {
	let blocks: Block[] = [];
	let onBufferingCallback: OnBufferingCallback[] = [];
	let onResumeCallback: OnBufferingCallback[] = [];

	const addBlock: AddBlock = (block: Block) => {
		blocks.push(block);
		onBufferingCallback.forEach((callback) => callback());
		return {
			unblock: () => {
				blocks = blocks.filter((b) => b !== block);
			},
		};
	};

	const listenForBuffering: ListenForBuffering = (
		callback: OnBufferingCallback,
	) => {
		onBufferingCallback.push(callback);
		return {
			remove: () => {
				onBufferingCallback = onBufferingCallback.filter((c) => c !== callback);
			},
		};
	};

	const listenForResume: ListenForResume = (callback: OnResumeCallback) => {
		onResumeCallback.push(callback);
		return {
			remove: () => {
				onResumeCallback = onResumeCallback.filter((c) => c !== callback);
			},
		};
	};

	return {
		blocks,
		addBlock,
		listenForBuffering,
		listenForResume,
	};
};

export const BufferingContextReact = React.createContext<BufferManager | null>(
	null,
);

export const BufferingProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [bufferManager] = useState(() => {
		return createBufferManager();
	});

	return (
		<BufferingContextReact.Provider value={bufferManager}>
			{children}
		</BufferingContextReact.Provider>
	);
};
