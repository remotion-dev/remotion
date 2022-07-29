import {interpolate} from 'remotion';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {scrollableRef} from './timeline-refs';

export const canScrollTimelineIntoDirection = () => {
	const current = scrollableRef.current as HTMLDivElement;
	const {scrollWidth, scrollLeft, clientWidth} = current;
	const canScrollRight =
		scrollWidth - scrollLeft - clientWidth > TIMELINE_PADDING;
	const canScrollLeft = scrollLeft > TIMELINE_PADDING;
	return {canScrollRight, canScrollLeft};
};

export const SCROLL_INCREMENT = 200;

const calculateFrameWhileScrollingRight = ({
	durationInFrames,
	width,
	frameIncrement,
	scrollLeft,
}: {
	durationInFrames: number;
	width: number;
	frameIncrement: number;
	scrollLeft: number;
}) => {
	return (
		getFrameFromX(scrollLeft, durationInFrames, width, 'clamp') +
		Math.ceil(
			((scrollableRef.current?.clientWidth as number) - TIMELINE_PADDING) /
				frameIncrement
		)
	);
};

export const getFrameWhileScrollingLeft = (
	durationInFrames: number,
	width: number
) => {
	const nextFrame = getFrameFromX(
		(scrollableRef.current?.scrollLeft as number) - SCROLL_INCREMENT,
		durationInFrames,
		width,
		'clamp'
	);
	const currentFrame = getFrameFromX(
		scrollableRef.current?.scrollLeft as number,
		durationInFrames,
		width,
		'clamp'
	);

	// Should go back at least 1 frame, but not less than 0
	return Math.max(0, Math.min(currentFrame - 1, nextFrame));
};

export const getFrameWhileScrollingRight = ({
	durationInFrames,
	width,
	frameIncrement,
}: {
	durationInFrames: number;
	width: number;
	frameIncrement: number;
}) => {
	const nextFrame = calculateFrameWhileScrollingRight({
		durationInFrames,
		width,
		frameIncrement,
		scrollLeft:
			(scrollableRef.current?.scrollLeft as number) + SCROLL_INCREMENT,
	});
	const currentFrame = calculateFrameWhileScrollingRight({
		durationInFrames,
		width,
		frameIncrement,
		scrollLeft: scrollableRef.current?.scrollLeft as number,
	});

	// Should scroll by at least 1 frame, but not overshoot duration
	return Math.min(durationInFrames - 1, Math.max(nextFrame, currentFrame + 1));
};

export const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number,
	extrapolate: 'clamp' | 'extend'
) => {
	const pos = clientX - TIMELINE_PADDING;
	const frame = Math.round(
		interpolate(
			pos,
			[0, width - TIMELINE_PADDING * 2],
			[0, durationInFrames - 1 ?? 0],
			{
				extrapolateLeft: extrapolate,
				extrapolateRight: extrapolate,
			}
		)
	);
	return frame;
};
