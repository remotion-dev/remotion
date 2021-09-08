import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {HighestZIndexContext} from './highest-z-index';

type ZIndex = {
	currentIndex: number;
};

export const ZIndexContext = createContext<ZIndex>({
	currentIndex: 0,
});

const EscapeHook: React.FC<{
	onEscape: () => void;
}> = ({onEscape}) => {
	const keybindings = useKeybinding();

	useEffect(() => {
		const escape = keybindings.registerKeybinding(
			'keydown',
			'Escape',
			onEscape
		);

		return () => {
			escape.unregister();
		};
	}, [keybindings, onEscape]);

	return null;
};

export const HigherZIndex: React.FC<{
	onEscape: () => void;
}> = ({children, onEscape}) => {
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
		<ZIndexContext.Provider value={value}>
			<EscapeHook onEscape={onEscape} />
			{children}
		</ZIndexContext.Provider>
	);
};

export const useZIndex = () => {
	const context = useContext(ZIndexContext);
	const highestContext = useContext(HighestZIndexContext);
	const isHighestContext = highestContext.highestIndex === context.currentIndex;

	return useMemo(
		() => ({
			currentZIndex: context.currentIndex,
			highestZIndex: highestContext.highestIndex,
			isHighestContext,
			tabIndex: isHighestContext ? 0 : -1,
		}),
		[context.currentIndex, highestContext.highestIndex, isHighestContext]
	);
};
