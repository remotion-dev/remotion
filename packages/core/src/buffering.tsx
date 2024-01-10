import React, {useMemo} from 'react';

type Block = {};

export type BufferingContext = {
	blocks: Block[];
	registerBlock: (block: Block) => void;
};

const BufferingContextReact = React.createContext<BufferingContext>({
	blocks: [],
	registerBlock: () => {
		throw new Error('registerBlock() not implemented');
	},
});

export const BufferingProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [blocks, setBlocks] = React.useState<Block[]>([]);

	const value: BufferingContext = useMemo(() => {
		return {
			blocks,
			registerBlock: (block) => {
				setBlocks((b) => [...b, block]);
			},
		};
	}, [blocks]);

	return (
		<BufferingContextReact.Provider value={value}>
			{children}
		</BufferingContextReact.Provider>
	);
};
