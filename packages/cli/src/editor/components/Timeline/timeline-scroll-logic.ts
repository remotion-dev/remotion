import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {scrollableRef} from './timeline-refs';

export const canScrollTimelineIntoDirection = () => {
	const current = scrollableRef.current as HTMLDivElement;
	const {scrollWidth, scrollLeft, clientWidth} = current;
	const canScrollRight =
		scrollWidth - scrollLeft - clientWidth > TIMELINE_PADDING;
	const canScrollLeft = scrollLeft > 0;
	return {canScrollRight, canScrollLeft};
};
