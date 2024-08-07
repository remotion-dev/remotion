import React, {createContext, useMemo, useState} from 'react';
import {useMobileLayout} from '../helpers/mobile-layout';

export type SidebarCollapsedState = 'collapsed' | 'expanded' | 'responsive';
type RightSidebarCollapsedState = Exclude<SidebarCollapsedState, 'responsive'>;

type Context = {
	sidebarCollapsedStateLeft: SidebarCollapsedState;
	setSidebarCollapsedState: (options: {
		left: null | React.SetStateAction<SidebarCollapsedState>;
		right: null | React.SetStateAction<RightSidebarCollapsedState>;
	}) => void;
	sidebarCollapsedStateRight: RightSidebarCollapsedState;
};

type Sidebars = 'left' | 'right';

const storageKey = (sidebar: Sidebars) => {
	if (sidebar === 'right') {
		return 'remotion.sidebarRightCollapsing';
	}

	return 'remotion.sidebarCollapsing';
};

const getSavedCollapsedStateLeft = (
	isMobileLayout = false,
): SidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey('left'));
	if (isMobileLayout) {
		return 'collapsed';
	}

	if (state === 'collapsed') {
		return 'collapsed';
	}

	if (state === 'expanded') {
		return 'expanded';
	}

	return 'responsive';
};

const getSavedCollapsedStateRight = (
	isMobileLayout = false,
): RightSidebarCollapsedState => {
	const state = window.localStorage.getItem(storageKey('right'));

	if (isMobileLayout) {
		return 'collapsed';
	}

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
	setSidebarCollapsedState: () => {
		throw new Error('sidebar collapsed state');
	},
	sidebarCollapsedStateRight: 'collapsed',
});

type SidebarState = {
	left: SidebarCollapsedState;
	right: RightSidebarCollapsedState;
};

export const SidebarContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const isMobileLayout = useMobileLayout();
	const [sidebarCollapsedState, setSidebarCollapsedState] =
		useState<SidebarState>(() => ({
			left: getSavedCollapsedStateLeft(isMobileLayout),
			right: getSavedCollapsedStateRight(isMobileLayout),
		}));

	const value: Context = useMemo(() => {
		return {
			sidebarCollapsedStateLeft: sidebarCollapsedState.left,
			sidebarCollapsedStateRight: sidebarCollapsedState.right,
			setSidebarCollapsedState: (options: {
				left: null | React.SetStateAction<SidebarCollapsedState>;
				right: null | React.SetStateAction<RightSidebarCollapsedState>;
			}) => {
				const {left, right} = options;
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
	}, [sidebarCollapsedState]);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
};
