import type {StudioKeyboardShortcutAction} from '@remotion/studio-shared';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {keyboardEventMatchesAction} from '../components/keyboard-shortcuts';
import type {KeyEventType, RegisteredKeybinding} from '../state/keybindings';
import {KeybindingContext} from '../state/keybindings';
import {useZIndex} from '../state/z-index';
import {isMac} from './is-mac';
import {getStudioKeyboardShortcutsEnabled} from './studio-runtime-config';

if (!getStudioKeyboardShortcutsEnabled()) {
	// eslint-disable-next-line no-console
	console.warn(
		'Keyboard shortcuts disabled either due to: a) --disable-keyboard-shortcuts being passed b) Config.setKeyboardShortcutsEnabled(false) being set or c) a Remotion version mismatch.',
	);
}

export const areKeyboardShortcutsDisabled = () => {
	return !getStudioKeyboardShortcutsEnabled();
};

export const useKeybinding = () => {
	const [paneId] = useState(() => String(Math.random()));
	const context = useContext(KeybindingContext);
	const {isHighestContext} = useZIndex();

	const registerKeybinding = useCallback(
		(
			options: {
				event: KeyEventType;
				callback: (e: KeyboardEvent) => void;
				preventDefault: boolean;
				triggerIfInputFieldFocused: boolean;
				keepRegisteredWhenNotHighestContext: boolean;
			} & (
				| {
						action: StudioKeyboardShortcutAction;
						key?: never;
						commandCtrlKey?: never;
				  }
				| {
						action?: never;
						key: string;
						commandCtrlKey: boolean;
				  }
			),
		) => {
			if (!isHighestContext && !options.keepRegisteredWhenNotHighestContext) {
				return {
					unregister: () => undefined,
				};
			}

			const listener = (e: KeyboardEvent) => {
				// Apparently, e.key can be undefined in Edge:
				// https://github.com/remotion-dev/remotion/issues/5637
				if (!e.key) {
					return;
				}

				const matches = options.action
					? keyboardEventMatchesAction(e, options.action)
					: e.key.toLowerCase() === options.key.toLowerCase() &&
						options.commandCtrlKey === (isMac ? e.metaKey : e.ctrlKey);

				if (matches && getStudioKeyboardShortcutsEnabled()) {
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
				key: options.action ?? options.key,
				callback: listener,
				id: String(Math.random()),
			};

			context.registerKeybinding(toRegister);
			return {
				unregister: () => context.unregisterKeybinding(toRegister),
			};
		},
		[context, isHighestContext, paneId],
	);

	useEffect(() => {
		return () => {
			context.unregisterPane(paneId);
		};
	}, [context, paneId]);

	return useMemo(
		() => ({registerKeybinding, isHighestContext}),
		[registerKeybinding, isHighestContext],
	);
};
