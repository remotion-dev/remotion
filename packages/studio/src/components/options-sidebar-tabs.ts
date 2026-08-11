import {createRef} from 'react';

export const optionsSidebarTabs = createRef<{
	selectInspectorPanel: () => void;
	selectRendersPanel: () => void;
}>();

export const selectOptionsSidebarInspectorPanel = () => {
	optionsSidebarTabs.current?.selectInspectorPanel();
};
