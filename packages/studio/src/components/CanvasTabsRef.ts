import {createRef} from 'react';
import type {CanvasContent} from 'remotion';

export const canvasTabsRef = createRef<{
	openTabs: (contents: CanvasContent[]) => void;
}>();
