import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {HighestZIndexContext} from './highest-z-index';
import {getClickLock} from './input-dragger-click-lock';

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
		const escape = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Escape',
			callback: onEscape,
			commandCtrlKey: false,
		});

		return () => {
			escape.unregister();
		};
	}, [keybindings, onEscape]);

	return null;
};

export const HigherZIndex: React.FC<{
	onEscape: () => void;
	onOutsideClick: () => void;
	children: React.ReactNode;
}> = ({children, onEscape, onOutsideClick}) => {
	const context = useContext(ZIndexContext);
	const highestContext = useContext(HighestZIndexContext);
	const containerRef = useRef<HTMLDivElement>(null);

	const currentIndex = context.currentIndex + 1;

	useEffect(() => {
		highestContext.registerZIndex(currentIndex);
		return () => highestContext.unregisterZIndex(currentIndex);
	}, [currentIndex, highestContext]);

	useEffect(() => {
		const listener = (e: MouseEvent) => {
			const outsideClick = !containerRef.current?.contains(e.target as Node);
			if (
				outsideClick &&
				highestContext.highestIndex === currentIndex &&
				!getClickLock() &&
				// Don't trigger if that click removed that node
				document.contains(e.target as Node)
			) {
				e.stopPropagation();
				onOutsideClick();
			}
		};

		window.addEventListener('click', listener);
		return () => window.removeEventListener('click', listener);
	}, [currentIndex, highestContext.highestIndex, onOutsideClick]);

	const value = useMemo((): ZIndex => {
		return {
			currentIndex,
		};
	}, [currentIndex]);

	return (
		<ZIndexContext.Provider value={value}>
			<EscapeHook onEscape={onEscape} />
			<div ref={containerRef}>{children}</div>
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
