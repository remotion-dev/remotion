import {createRef} from 'react';

export const explorerSidebarTabs = createRef<{
	selectAssetsPanel: () => void;
	selectCompositionPanel: () => void;
}>();
