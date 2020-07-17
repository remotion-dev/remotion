import {useTimelinePosition} from './timeline-position-state';

export const useCurrentFrame = (): number => {
	const [timelinePosition] = useTimelinePosition();

	const param = new URLSearchParams(window.location.search).get('frame');
	if (param !== null) {
		return Number(param);
	}
	return timelinePosition;
};
