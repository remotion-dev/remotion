import {MenuId} from '../components/Menu/MenuItem';

let globalMenuId: MenuId | null = null;

export const setGlobalMenuId = (menuId: MenuId | null) => {
	globalMenuId = menuId;
};

export const getGlobalMenuId = () => globalMenuId;
