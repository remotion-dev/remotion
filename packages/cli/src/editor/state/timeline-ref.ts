import {createRef} from 'react';

export type TimelineRef = {
	collapseAll: () => void;
	expandAll: () => void;
};

export const timelineRef = createRef<TimelineRef>();
