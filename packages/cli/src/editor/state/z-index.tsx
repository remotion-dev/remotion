import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {HighestZIndexContext} from './highest-z-index';

type ZIndex = {
	currentIndex: number;
};

export const ZIndexContext = createContext<ZIndex>({
	currentIndex: 0,
});

export const HigherZIndex: React.FC = ({children}) => {
	const context = useContext(ZIndexContext);
	const highestContext = useContext(HighestZIndexContext);

	const currentIndex = context.currentIndex + 1;

	useEffect(() => {
		highestContext.registerZIndex(currentIndex);
		return () => highestContext.unregisterZIndex(currentIndex);
	}, [currentIndex, highestContext]);

	const value = useMemo((): ZIndex => {
		return {
			currentIndex,
		};
	}, [currentIndex]);

	return (
		<ZIndexContext.Provider value={value}>{children}</ZIndexContext.Provider>
	);
};

export const useZIndex = () => {
	const context = useContext(ZIndexContext);
	const highestContext = useContext(HighestZIndexContext);

	return useMemo(
		() => ({
			currentZIndex: context.currentIndex,
			highestZIndex: highestContext.highestIndex,
			tabIndex: context.currentIndex === highestContext.highestIndex ? 0 : -1,
		}),
		[context.currentIndex, highestContext.highestIndex]
	);
};
