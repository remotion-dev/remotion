export const MENU_ITEMS_CONTAINER = 'remotion-menu-buttons-container';
export const MENU_BUTTON_CLASS_NAME = 'remotion-menu-button';
export const SUBMENU_CONTAINER_CLASS_NAME = 'remotion-submenu';

export const isClickInsideMenuStructure = (el: HTMLElement) => {
	if (document.querySelector(`.${MENU_ITEMS_CONTAINER}`)?.contains(el)) {
		return true;
	}

	if (
		document.querySelector(`.${SUBMENU_CONTAINER_CLASS_NAME}`)?.contains(el)
	) {
		return true;
	}

	if (document.querySelector(`.${SUBMENU_CONTAINER_CLASS_NAME}`) === el) {
		return true;
	}

	if (document.querySelector(`.${MENU_ITEMS_CONTAINER}`) === el) {
		return true;
	}

	return false;
};
