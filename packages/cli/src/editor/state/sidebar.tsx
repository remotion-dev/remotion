import React, {createContext, useMemo, useState} from 'react';

export type SidebarCollapsedState = 'collapsed' | 'expanded' | 'responsive';

type Context = {
	sidebarCollapsedState: SidebarCollapsedState;
	setSidebarCollapsedState: (newState: SidebarCollapsedState) => void;
};

const storageKey = 'remotion.sidebarCollapsing';

export const getSavedCollapsedState = (): SidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey);
	if (state === 'collapsed') {
		return 'collapsed';
	}

	if (state === 'expanded') {
		return 'expanded';
	}

	return 'responsive';
};

const setSavedCollapsedState = (type: SidebarCollapsedState) => {
	window.localStorage.setItem(storageKey, type);
};

export const SidebarContext = createContext<Context>({
	sidebarCollapsedState: 'collapsed',
	setSidebarCollapsedState: () => {
		throw new Error('sidebar collapsed state');
	},
});

export const SidebarContextProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [sidebarCollapsedState, setSidebarCollapsedState] = useState(() =>
		getSavedCollapsedState()
	);

	const value: Context = useMemo(() => {
		return {
			setSidebarCollapsedState: (state: SidebarCollapsedState) => {
				setSidebarCollapsedState(state);
				setSavedCollapsedState(state);
			},
			sidebarCollapsedState,
		};
	}, [sidebarCollapsedState]);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
};
