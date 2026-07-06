import {createRef} from 'react';

export const optionsSidebarTabs = createRef<{
	selectInspectorPanel: () => void;
	selectRendersPanel: () => void;
}>();
