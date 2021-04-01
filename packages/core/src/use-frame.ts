import {useContext} from 'react';
import {SequenceContext} from './sequencing';
import {useTimelinePosition} from './timeline-position-state';

export const useAbsoluteCurrentFrame = (): number => {
	const timelinePosition = useTimelinePosition();

	return timelinePosition;
};

export const useCurrentFrame = (): number => {
	const frame = useAbsoluteCurrentFrame();
	const context = useContext(SequenceContext);

	const contextOffset = context
		? context.cumulatedFrom + context.relativeFrom
		: 0;

	return frame - contextOffset;
};
