import {useContext} from 'react';
import {SequenceContext} from './sequencing';
import {useTimelinePosition} from './timeline-position-state';

export const useAbsoluteCurrentFrame = (): number => {
	const [timelinePosition] = useTimelinePosition();

	const param = new URLSearchParams(window.location.search).get('frame');
	if (param !== null) {
		return Number(param);
	}
	return timelinePosition;
};

export const useCurrentFrame = (): number => {
	const frame = useAbsoluteCurrentFrame();
	const context = useContext(SequenceContext);

	const contextOffset = context ? context.from : 0;

	return frame - contextOffset;
};
