import React, {createContext, useCallback, useMemo, useState} from 'react';

type HighestZIndexContainer = {
	highestIndex: number;
	registerZIndex: (index: number) => void;
	unregisterZIndex: (index: number) => void;
};

export const HighestZIndexContext = createContext<HighestZIndexContainer>({
	highestIndex: 0,
	registerZIndex: () => undefined,
	unregisterZIndex: () => undefined,
});

export const HighestZIndexProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [zIndexes, setZIndexes] = useState<number[]>([]);

	const registerZIndex = useCallback((newIndex: number) => {
		setZIndexes((prev) => [...prev, newIndex]);
	}, []);

	const unregisterZIndex = useCallback((newIndex: number) => {
		setZIndexes((prev) => {
			const index = prev.indexOf(newIndex);
			if (index === -1) {
				throw new Error('did not find z-index ' + newIndex);
			}

			return prev.filter((_n, i) => i !== index);
		});
	}, []);

	const highestIndex = Math.max(...zIndexes);

	const value = useMemo((): HighestZIndexContainer => {
		return {
			highestIndex,
			registerZIndex,
			unregisterZIndex,
		};
	}, [registerZIndex, unregisterZIndex, highestIndex]);

	return (
		<HighestZIndexContext.Provider value={value}>
			{children}
		</HighestZIndexContext.Provider>
	);
};
