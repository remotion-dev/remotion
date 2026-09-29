import React, {createContext, useMemo, useState} from 'react';

export type SidebarCollapsedState = 'collapsed' | 'expanded' | 'responsive';

type Context = {
	rightSidebarTemporaryExpansion: boolean;
	setRightSidebarTemporaryExpansion: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	sidebarCollapsedDuringDrag: Sidebars | null;
	setSidebarCollapsedDuringDrag: (side: Sidebars | null) => void;
	sidebarCollapsedStateLeft: SidebarCollapsedState;
	setSidebarCollapsedState: (options: {
		left: null | React.SetStateAction<SidebarCollapsedState>;
		right: null | React.SetStateAction<SidebarCollapsedState>;
	}) => void;
	sidebarCollapsedStateRight: SidebarCollapsedState;
};

type Sidebars = 'left' | 'right';

const storageKey = (sidebar: Sidebars) => {
	if (sidebar === 'right') {
		return 'remotion.sidebarRightCollapsing.v2';
	}

	return 'remotion.sidebarCollapsing.v2';
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

const getSavedCollapsedStateRight = (): SidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey('right'));

	if (state === 'expanded') {
		return 'expanded';
	}

	if (state === 'collapsed') {
		return 'collapsed';
	}

	return 'responsive';
};

const saveCollapsedState = (type: SidebarCollapsedState, sidebar: Sidebars) => {
	window.localStorage.setItem(storageKey(sidebar), type);
};

export const SidebarContext = createContext<Context>({
	rightSidebarTemporaryExpansion: false,
	setRightSidebarTemporaryExpansion: () => undefined,
	sidebarCollapsedDuringDrag: null,
	setSidebarCollapsedDuringDrag: () => undefined,
	sidebarCollapsedStateLeft: 'responsive',
	setSidebarCollapsedState: () => {
		throw new Error('sidebar collapsed state');
	},
	sidebarCollapsedStateRight: 'responsive',
});

type SidebarState = {
	left: SidebarCollapsedState;
	right: SidebarCollapsedState;
};

export const SidebarContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [sidebarCollapsedState, setSidebarCollapsedState] =
		useState<SidebarState>(() => ({
			left: getSavedCollapsedStateLeft(),
			right: getSavedCollapsedStateRight(),
		}));

	const [sidebarCollapsedDuringDrag, setSidebarCollapsedDuringDrag] =
		useState<Sidebars | null>(null);
	const [rightSidebarTemporaryExpansion, setRightSidebarTemporaryExpansion] =
		useState(false);

	const value: Context = useMemo(() => {
		return {
			rightSidebarTemporaryExpansion,
			setRightSidebarTemporaryExpansion,
			sidebarCollapsedDuringDrag,
			setSidebarCollapsedDuringDrag,
			sidebarCollapsedStateLeft: sidebarCollapsedState.left,
			sidebarCollapsedStateRight: sidebarCollapsedState.right,
			setSidebarCollapsedState: (options: {
				left: null | React.SetStateAction<SidebarCollapsedState>;
				right: null | React.SetStateAction<SidebarCollapsedState>;
			}) => {
				const {left, right} = options;
				if (right !== null) {
					setRightSidebarTemporaryExpansion(false);
				}

				setSidebarCollapsedState((f) => {
					const copied = {...f};
					if (left) {
						const updatedLeft =
							typeof left === 'function' ? left(f.left) : left;
						saveCollapsedState(updatedLeft, 'left');
						copied.left = updatedLeft;
					}

					if (right) {
						const updatedRight =
							typeof right === 'function' ? right(f.right) : right;
						saveCollapsedState(updatedRight, 'right');
						copied.right = updatedRight;
					}

					return copied;
				});
			},
		};
	}, [
		rightSidebarTemporaryExpansion,
		sidebarCollapsedState,
		sidebarCollapsedDuringDrag,
	]);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
};
