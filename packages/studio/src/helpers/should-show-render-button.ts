import {SHOW_BROWSER_RENDERING} from './show-browser-rendering';

export const shouldShowRenderButton = (readOnlyStudio: boolean) => {
	if (readOnlyStudio) {
		return SHOW_BROWSER_RENDERING;
	}

	return true;
};
