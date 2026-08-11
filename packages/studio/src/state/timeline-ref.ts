import {createRef} from 'react';

type TimelineRef = {
	collapseAll: () => void;
	expandAll: () => void;
};

export const timelineRef = createRef<TimelineRef>();
