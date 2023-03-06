export const MENU_INITIATOR_CLASSNAME = '__remotion-preview-menu-initiator';
export const MENU_ITEM_CLASSNAME = '__remotion-preview-menu-item';

export const isMenuItem = (el: HTMLElement): boolean => {
	return Boolean(
		el.classList.contains(MENU_ITEM_CLASSNAME) ||
			el.closest(`.${MENU_ITEM_CLASSNAME}`) ||
			el.classList.contains(MENU_INITIATOR_CLASSNAME) ||
			el.closest(`.${MENU_INITIATOR_CLASSNAME}`)
	);
};
