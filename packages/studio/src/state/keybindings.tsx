import React, {createContext, useCallback, useMemo, useRef} from 'react';

export type KeyEventType = 'keydown' | 'keyup' | 'keypress';

type KeyListenerCallback = (e: KeyboardEvent) => void;

export type RegisteredKeybinding = {
	registeredFromPane: string;
	id: string;
	key: string;
	event: KeyEventType;
	callback: KeyListenerCallback;
};

type KeybindingContextType = {
	registerKeybinding: (binding: RegisteredKeybinding) => void;
	unregisterKeybinding: (binding: RegisteredKeybinding) => void;
	unregisterPane: (paneId: string) => void;
};

export const KeybindingContext = createContext<KeybindingContextType>({
	registerKeybinding: () => {
		throw new Error('Has no keybinding context');
	},
	unregisterKeybinding: () => undefined,
	unregisterPane: () => undefined,
});

export const KeybindingContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const registered = useRef<RegisteredKeybinding[]>([]);

	const registerKeybinding = useCallback((binding: RegisteredKeybinding) => {
		registered.current = [...registered.current, binding];
		window.addEventListener(binding.event, binding.callback);
	}, []);

	const unregisterKeybinding = useCallback((binding: RegisteredKeybinding) => {
		registered.current = registered.current.filter((r) => {
			if (r.id === binding.id) {
				window.removeEventListener(binding.event, binding.callback);

				return false;
			}

			return true;
		});
	}, []);

	const unregisterPane = useCallback(
		(paneId: string) => {
			const matchedKeybindings = registered.current.filter(
				(r) => r.registeredFromPane === paneId,
			);
			for (const matched of matchedKeybindings) {
				unregisterKeybinding(matched);
			}
		},
		[unregisterKeybinding],
	);

	const value = useMemo((): KeybindingContextType => {
		return {
			registerKeybinding,
			unregisterKeybinding,
			unregisterPane,
		};
	}, [registerKeybinding, unregisterKeybinding, unregisterPane]);

	return (
		<KeybindingContext.Provider value={value}>
			{children}
		</KeybindingContext.Provider>
	);
};
