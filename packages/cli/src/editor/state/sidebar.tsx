import React, {createContext, useMemo, useState} from 'react';

export type SidebarCollapsedState = 'collapsed' | 'expanded' | 'responsive';
export type RightSidebarCollapsedState = Exclude<
	SidebarCollapsedState,
	'responsive'
>;

type Context = {
	sidebarCollapsedStateLeft: SidebarCollapsedState;
	setSidebarCollapsedStateLeft: React.Dispatch<
		React.SetStateAction<SidebarCollapsedState>
	>;
	sidebarCollapsedStateRight: RightSidebarCollapsedState;
	setSidebarCollapsedStateRight: React.Dispatch<
		React.SetStateAction<RightSidebarCollapsedState>
	>;
};

type Sidebars = 'left' | 'right';

const storageKey = (sidebar: Sidebars) => {
	if (sidebar === 'right') {
		return 'remotion.sidebarRightCollapsing';
	}

	return 'remotion.sidebarCollapsing';
};

const getSavedCollapsedStateLeft = (): SidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey('left'));
	if (state === 'collapsed') {
		return 'collapsed';
	}

	if (state === 'expanded') {
		return 'expanded';
	}

	return 'responsive';
};

const getSavedCollapsedStateRight = (): RightSidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey('right'));
	if (state === 'expanded') {
		return 'expanded';
	}

	return 'collapsed';
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
		() => getSavedCollapsedStateLeft()
	);
	const [sidebarCollapsedStateRight, setSidebarCollapsedStateRight] = useState(
		() => getSavedCollapsedStateRight()
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
				state: React.SetStateAction<RightSidebarCollapsedState>
			) => {
				setSidebarCollapsedStateRight((f) => {
					const updated =
						typeof state === 'function'
							? state(f as RightSidebarCollapsedState)
							: state;
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
