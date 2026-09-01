import React, {
	createContext,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {observePointerRelease} from '../helpers/pointer-session';
import {useKeybinding} from '../helpers/use-keybinding';
import {HighestZIndexContext} from './highest-z-index';
import {getClickLock} from './input-dragger-click-lock';

type ZIndex = {
	currentIndex: number;
};

const ZIndexContext = createContext<ZIndex>({
	currentIndex: 0,
});

const margin: React.CSSProperties = {
	margin: 'auto',
};

const EscapeHook: React.FC<{
	readonly onEscape: () => void;
}> = ({onEscape}) => {
	const keybindings = useKeybinding();

	useLayoutEffect(() => {
		const escape = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Escape',
			callback: onEscape,
			commandCtrlKey: false,
			preventDefault: true,
			// To dismiss the Quick Switcher menu if input is focused
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			escape.unregister();
		};
	}, [keybindings, onEscape]);

	return null;
};

export const HigherZIndex: React.FC<{
	readonly onEscape: () => void;
	readonly onOutsideClick: (target: Node) => void;
	readonly children: React.ReactNode;
	readonly disabled?: boolean;
	readonly outsideClickButton?: 'any' | 'primary';
}> = ({
	children,
	onEscape,
	onOutsideClick,
	disabled,
	outsideClickButton = 'any',
}) => {
	const context = useContext(ZIndexContext);
	const highestContext = useContext(HighestZIndexContext);
	const {registerZIndex, unregisterZIndex} = highestContext;
	const containerRef = useRef<HTMLDivElement>(null);
	const highestIndexRef = useRef(highestContext.highestIndex);
	const onOutsideClickRef = useRef(onOutsideClick);
	const outsideClickButtonRef = useRef(outsideClickButton);

	const currentIndex = disabled
		? context.currentIndex
		: context.currentIndex + 1;

	useLayoutEffect(() => {
		highestIndexRef.current = highestContext.highestIndex;
		onOutsideClickRef.current = onOutsideClick;
		outsideClickButtonRef.current = outsideClickButton;
	}, [highestContext.highestIndex, onOutsideClick, outsideClickButton]);

	useLayoutEffect(() => {
		if (disabled) {
			return;
		}

		registerZIndex(currentIndex);
		return () => unregisterZIndex(currentIndex);
	}, [currentIndex, disabled, registerZIndex, unregisterZIndex]);

	useLayoutEffect(() => {
		if (disabled) {
			return;
		}

		let endPointerSession: (() => void) | null = null;

		const listener = (downEvent: PointerEvent) => {
			if (
				outsideClickButtonRef.current === 'primary' &&
				downEvent.button !== 0
			) {
				return;
			}

			const outsideClick = !containerRef.current?.contains(
				downEvent.target as Node,
			);
			if (!outsideClick) {
				return;
			}

			// The topmost layer owns the full pointer gesture. Layers may mount or
			// unmount before pointerup, but that must not cancel or transfer dismissal.
			if (highestIndexRef.current !== currentIndex) {
				return;
			}

			endPointerSession?.();
			endPointerSession = observePointerRelease({
				event: downEvent,
				onEnd: (reason, upEvent) => {
					endPointerSession = null;
					if (
						(reason === 'pointerup' || reason === 'buttons-released') &&
						upEvent &&
						!getClickLock()
					) {
						const target =
							document.elementFromPoint(upEvent.clientX, upEvent.clientY) ??
							(upEvent.target as Element);
						if (document.contains(target)) {
							upEvent.stopPropagation();
							onOutsideClickRef.current(target);
						}
					}
				},
			});
		};

		window.addEventListener('pointerdown', listener, true);
		return () => {
			endPointerSession?.();
			endPointerSession = null;

			return window.removeEventListener('pointerdown', listener, true);
		};
	}, [currentIndex, disabled]);

	const value = useMemo((): ZIndex => {
		return {
			currentIndex,
		};
	}, [currentIndex]);

	return (
		<ZIndexContext.Provider value={value}>
			{disabled ? null : <EscapeHook onEscape={onEscape} />}
			<div ref={containerRef} style={margin}>
				{children}
			</div>
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
		[context.currentIndex, highestContext.highestIndex, isHighestContext],
	);
};
