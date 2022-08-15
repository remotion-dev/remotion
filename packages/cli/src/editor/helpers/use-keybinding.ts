import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {KeyEventType, RegisteredKeybinding} from '../state/keybindings';
import {KeybindingContext} from '../state/keybindings';
import {useZIndex} from '../state/z-index';

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
		}) => {
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
					options.callback(e);
					e.preventDefault();
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
