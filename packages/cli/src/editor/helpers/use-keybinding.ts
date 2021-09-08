import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
	KeybindingContext,
	KeyEventType,
	RegisteredKeybinding,
} from '../state/keybindings';
import {useZIndex} from '../state/z-index';

export const useKeybinding = () => {
	const [paneId] = useState(() => String(Math.random()));
	const context = useContext(KeybindingContext);
	const {isHighestContext} = useZIndex();

	const registerKeybinding = useCallback(
		(
			event: KeyEventType,
			key: string,
			callback: (e: KeyboardEvent) => void
		) => {
			if (!isHighestContext) {
				return {
					unregister: () => undefined,
				};
			}

			const listener = (e: KeyboardEvent) => {
				if (e.key === key) {
					callback(e);
				}
			};

			const toRegister: RegisteredKeybinding = {
				registeredFromPane: paneId,
				event,
				key,
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

	return useMemo(() => ({registerKeybinding, isHighestContext}), [
		registerKeybinding,
		isHighestContext,
	]);
};
