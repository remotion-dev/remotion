import React from 'react';
import {MenuId} from '../components/Menu/MenuItem';

export type MenuContext = {
	selected: MenuId | null;
	setSelected: React.Dispatch<React.SetStateAction<MenuId | null>>;
};

export const MenuToolbarSelectionContext = React.createContext<MenuContext>({
	selected: null,
	setSelected: () => {
		throw new Error('no context');
	},
});
