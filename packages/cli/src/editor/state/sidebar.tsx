import React, {createContext, useMemo, useState} from 'react';

export type SidebarCollapsedState = 'collapsed' | 'expanded' | 'responsive';

type Context = {
	sidebarCollapsedStateLeft: SidebarCollapsedState;
	setSidebarCollapsedStateLeft: React.Dispatch<
		React.SetStateAction<SidebarCollapsedState>
	>;
	sidebarCollapsedStateRight: SidebarCollapsedState;
	setSidebarCollapsedStateRight: React.Dispatch<
		React.SetStateAction<SidebarCollapsedState>
	>;
};

type Sidebars = 'left' | 'right';

const storageKey = (sidebar: Sidebars) => {
	if (sidebar === 'right') {
		return 'remotion.sidebarRightCollapsing';
	}

	return 'remotion.sidebarCollapsing';
};

export const getSavedCollapsedState = (
	sidebar: Sidebars
): SidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey(sidebar));
	if (state === 'collapsed') {
		return 'collapsed';
	}

	if (state === 'expanded') {
		return 'expanded';
	}

	return 'responsive';
};

const saveCollapsedState = (type: SidebarCollapsedState, sidebar: Sidebars) => {
	window.localStorage.setItem(storageKey(sidebar), type);
};

export const SidebarContext = createContext<Context>({
	sidebarCollapsedStateLeft: 'collapsed',
	setSidebarCollapsedStateLeft: () => {
		throw new Error('sidebar collapsed state');
	},
	sidebarCollapsedStateRight: 'collapsed',
	setSidebarCollapsedStateRight: () => {
		throw new Error('sidebar collapsed state');
	},
});

export const SidebarContextProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [sidebarCollapsedStateLeft, setSidebarCollapsedStateLeft] = useState(
		() => getSavedCollapsedState('left')
	);
	const [sidebarCollapsedStateRight, setSidebarCollapsedStateRight] = useState(
		() => getSavedCollapsedState('right')
	);

	const value: Context = useMemo(() => {
		return {
			sidebarCollapsedStateLeft,
			sidebarCollapsedStateRight,
			setSidebarCollapsedStateLeft: (
				state: React.SetStateAction<SidebarCollapsedState>
			) => {
				setSidebarCollapsedStateLeft((f) => {
					const updated = typeof state === 'function' ? state(f) : state;
					saveCollapsedState(updated, 'left');
					return updated;
				});
			},
			setSidebarCollapsedStateRight: (
				state: React.SetStateAction<SidebarCollapsedState>
			) => {
				setSidebarCollapsedStateRight((f) => {
					const updated = typeof state === 'function' ? state(f) : state;
					saveCollapsedState(updated, 'right');
					return updated;
				});
			},
		};
	}, [sidebarCollapsedStateLeft, sidebarCollapsedStateRight]);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
};
