import React, {createContext, useCallback, useMemo, useRef} from 'react';

export type KeyEventType = 'keydown' | 'keyup' | 'keypress';

export type KeyListenerCallback = (e: KeyboardEvent) => void;

export type RegisteredKeybinding = {
	registeredFromPane: string;
	id: string;
	key: string;
	event: KeyEventType;
	callback: KeyListenerCallback;
};

type StashedKeybinding = {
	stashedPane: string;
	binding: RegisteredKeybinding;
};

export type KeybindingContextType = {
	registerKeybinding: (binding: RegisteredKeybinding) => void;
	unregisterKeybinding: (binding: RegisteredKeybinding) => void;
	stashOtherKeybindings: (paneId: string) => void;
	unstashOtherKeybindings: (paneId: string) => void;
	unregisterPane: (paneId: string) => void;
};

export const KeybindingContext = createContext<KeybindingContextType>({
	registerKeybinding: () => undefined,
	unregisterKeybinding: () => undefined,
	unregisterPane: () => undefined,
	stashOtherKeybindings: () => undefined,
	unstashOtherKeybindings: () => undefined,
});

export const KeybindingContextProvider: React.FC = ({children}) => {
	const registered = useRef<RegisteredKeybinding[]>([]);
	const stashed = useRef<StashedKeybinding[]>([]);

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
		stashed.current = stashed.current.filter((r) => {
			if (r.binding.id === binding.id) {
				window.removeEventListener(binding.event, binding.callback);

				return false;
			}

			return true;
		});
	}, []);

	const stashOtherKeybindings = useCallback(
		(paneId: string) => {
			const matchedKeybindings = registered.current.filter(
				(r) => r.registeredFromPane !== paneId
			);
			stashed.current = [
				...stashed.current,
				...matchedKeybindings.map(
					(binding): StashedKeybinding => ({
						binding,
						stashedPane: paneId,
					})
				),
			];
			for (const binding of matchedKeybindings) {
				unregisterKeybinding(binding);
			}
		},
		[unregisterKeybinding]
	);
	const unstashOtherKeybindings = useCallback(
		(paneId: string) => {
			const matchedKeybindings = stashed.current.filter(
				(r) => r.stashedPane === paneId
			);
			for (const {binding} of matchedKeybindings) {
				registerKeybinding(binding);
			}

			stashed.current = stashed.current.filter((r) => r.stashedPane !== paneId);
		},
		[registerKeybinding]
	);

	const unregisterPane = useCallback(
		(paneId: string) => {
			unstashOtherKeybindings(paneId);
			stashed.current = stashed.current.filter((r) => r.stashedPane !== paneId);
			const matchedKeybindings = registered.current.filter(
				(r) => r.registeredFromPane === paneId
			);
			for (const matched of matchedKeybindings) {
				unregisterKeybinding(matched);
			}
		},
		[unregisterKeybinding, unstashOtherKeybindings]
	);

	const value = useMemo((): KeybindingContextType => {
		return {
			registerKeybinding,
			unregisterKeybinding,
			stashOtherKeybindings,
			unstashOtherKeybindings,
			unregisterPane,
		};
	}, [
		registerKeybinding,
		stashOtherKeybindings,
		unregisterKeybinding,
		unregisterPane,
		unstashOtherKeybindings,
	]);

	return (
		<KeybindingContext.Provider value={value}>
			{children}
		</KeybindingContext.Provider>
	);
};
