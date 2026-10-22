import React from 'react';

export const sliderAreaRef = React.createRef<HTMLDivElement>();
export const scrollableRef = React.createRef<HTMLDivElement>();
export const timelineVerticalScroll = React.createRef<HTMLDivElement>();

export const timelineDurationRef = React.createRef<{
	getDuration: (durationInFrames: number) => number | null;
}>();

// Geometry of mounted timeline bars. Reading this ref never subscribes the
// inspector to timeline updates or walks the underlying sequence tree.
export const timelineLayerLayoutsRef = {
	current: new Map<
		string,
		{
			readonly marginLeft: number;
			readonly media: {readonly left: number; readonly width: number} | null;
		}
	>(),
};
