import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {KeyEventType, RegisteredKeybinding} from '../state/keybindings';
import {KeybindingContext} from '../state/keybindings';
import {useZIndex} from '../state/z-index';

if (!process.env.KEYBOARD_SHORTCUTS_ENABLED) {
	console.warn(
		'Keyboard shortcuts disabled either due to: a) --disable-keyboard-shortcuts being passed b) Config.setKeyboardShortcutsEnabled(false) being set or c) a Remotion version mismatch.'
	);
}

export const areKeyboardShortcutsDisabled = () => {
	return !process.env.KEYBOARD_SHORTCUTS_ENABLED;
};

export const useKeybinding = () => {
	const [paneId] = useState(() => String(Math.random()));
	const context = useContext(KeybindingContext);
	const {isHighestContext} = useZIndex();

	const registerKeybinding = useCallback(
		(options: {
			event: KeyEventType;
			key: string;
			commandCtrlKey: boolean;
			callback: (e: KeyboardEvent) => void;
			preventDefault: boolean;
			triggerIfInputFieldFocused: boolean;
		}) => {
			if (!process.env.KEYBOARD_SHORTCUTS_ENABLED) {
				return {
					unregister: () => undefined,
				};
			}

			if (!isHighestContext) {
				return {
					unregister: () => undefined,
				};
			}

			const listener = (e: KeyboardEvent) => {
				const commandKey = window.navigator.platform.startsWith('Mac')
					? e.metaKey
					: e.ctrlKey;
				if (
					e.key.toLowerCase() === options.key.toLowerCase() &&
					options.commandCtrlKey === commandKey
				) {
					if (!options.triggerIfInputFieldFocused) {
						const {activeElement} = document;
						if (activeElement instanceof HTMLInputElement) {
							return;
						}

						if (activeElement instanceof HTMLTextAreaElement) {
							return;
						}
					}

					options.callback(e);
					if (options.preventDefault) {
						e.preventDefault();
					}
				}
			};

			const toRegister: RegisteredKeybinding = {
				registeredFromPane: paneId,
				event: options.event,
				key: options.key,
				callback: listener,
				id: String(Math.random()),
			};

			context.registerKeybinding(toRegister);
			return {
				unregister: () => context.unregisterKeybinding(toRegister),
			};
		},
		[context, isHighestContext, paneId]
	);

	useEffect(() => {
		return () => {
			context.unregisterPane(paneId);
		};
	}, [context, paneId]);

	return useMemo(
		() => ({registerKeybinding, isHighestContext}),
		[registerKeybinding, isHighestContext]
	);
};
