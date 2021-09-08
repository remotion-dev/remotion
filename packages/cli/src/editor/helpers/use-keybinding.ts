import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
	KeybindingContext,
	KeyEventType,
	RegisteredKeybinding,
} from '../state/keybindings';

export const useKeybinding = () => {
	const [paneId] = useState(() => String(Math.random()));
	const context = useContext(KeybindingContext);

	const stashOther = useCallback(() => {
		context.stashOtherKeybindings(paneId);
	}, [context, paneId]);

	const unstashOther = useCallback(() => {
		context.unstashOtherKeybindings(paneId);
	}, [context, paneId]);

	const registerKeybinding = useCallback(
		(
			event: KeyEventType,
			key: string,
			callback: (e: KeyboardEvent) => void
		) => {
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
		[context, paneId]
	);

	useEffect(() => {
		return () => {
			context.unregisterPane(paneId);
			context.unstashOtherKeybindings(paneId);
		};
	}, [context, paneId]);

	return useMemo(() => ({registerKeybinding, stashOther, unstashOther}), [
		registerKeybinding,
		stashOther,
		unstashOther,
	]);
};
