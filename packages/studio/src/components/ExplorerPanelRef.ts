import {createRef} from 'react';

export type ExplorerSidebarPanel = 'assets' | 'compositions';

export const explorerSidebarTabs = createRef<{
	getSelectedPanel: () => ExplorerSidebarPanel;
	selectAssetsPanel: () => void;
	selectCompositionPanel: () => void;
}>();
