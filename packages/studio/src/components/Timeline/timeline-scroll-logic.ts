import {interpolate} from 'remotion';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {redrawTimelineSliderFast} from './TimelineSlider';
import {scrollableRef} from './timeline-refs';

export const canScrollTimelineIntoDirection = () => {
	const current = scrollableRef.current as HTMLDivElement;
	const {scrollWidth, scrollLeft, clientWidth} = current;
	const canScrollRight =
		scrollWidth - scrollLeft - clientWidth > TIMELINE_PADDING;
	const canScrollLeft = scrollLeft > TIMELINE_PADDING;
	return {canScrollRight, canScrollLeft};
};

const SCROLL_INCREMENT = 200;

const calculateFrameWhileScrollingRight = ({
	durationInFrames,
	width,
	scrollLeft,
}: {
	durationInFrames: number;
	width: number;
	scrollLeft: number;
}) => {
	return (
		getFrameFromX({
			clientX: scrollLeft,
			durationInFrames,
			width,
			extrapolate: 'clamp',
		}) +
		Math.ceil(
			((scrollableRef.current?.clientWidth as number) - TIMELINE_PADDING) /
				getFrameIncrement(durationInFrames),
		)
	);
};

export const getFrameWhileScrollingLeft = ({
	durationInFrames,
	width,
}: {
	durationInFrames: number;
	width: number;
}) => {
	const nextFrame = getFrameFromX({
		clientX: (scrollableRef.current?.scrollLeft as number) - SCROLL_INCREMENT,
		durationInFrames,
		width,
		extrapolate: 'clamp',
	});
	const currentFrame = getFrameFromX({
		clientX: scrollableRef.current?.scrollLeft as number,
		durationInFrames,
		width,
		extrapolate: 'clamp',
	});

	// Should go back at least 1 frame, but not less than 0
	return Math.max(0, Math.min(currentFrame - 1, nextFrame));
};

export const isCursorInViewport = ({
	frame,
	durationInFrames,
}: {
	frame: number;
	durationInFrames: number;
}) => {
	const width = scrollableRef.current?.scrollWidth ?? 0;
	const scrollLeft = scrollableRef.current?.scrollLeft ?? 0;

	const scrollPosOnRightEdge = getScrollPositionForCursorOnRightEdge({
		nextFrame: frame,
		durationInFrames,
	});
	const scrollPosOnLeftEdge = getScrollPositionForCursorOnLeftEdge({
		nextFrame: frame,
		durationInFrames,
	});

	const currentFrameRight = calculateFrameWhileScrollingRight({
		durationInFrames,
		scrollLeft,
		width,
	});

	return !(
		scrollPosOnRightEdge >=
			getScrollPositionForCursorOnRightEdge({
				nextFrame: currentFrameRight,
				durationInFrames,
			}) || scrollPosOnLeftEdge < scrollLeft
	);
};

export const ensureFrameIsInViewport = ({
	direction,
	durationInFrames,
	frame,
}: {
	direction: 'fit-left' | 'fit-right' | 'page-right' | 'page-left' | 'center';
	durationInFrames: number;
	frame: number;
}) => {
	redrawTimelineSliderFast.current?.draw(frame);
	const width = scrollableRef.current?.scrollWidth ?? 0;
	const scrollLeft = scrollableRef.current?.scrollLeft ?? 0;
	if (direction === 'fit-left') {
		const currentFrameLeft = getFrameFromX({
			clientX: scrollLeft,
			durationInFrames,
			width,
			extrapolate: 'clamp',
		});
		const scrollPos = getScrollPositionForCursorOnLeftEdge({
			nextFrame: frame,
			durationInFrames,
		});
		const needsToScrollLeft =
			scrollPos <=
			getScrollPositionForCursorOnLeftEdge({
				nextFrame: currentFrameLeft,
				durationInFrames,
			});
		if (needsToScrollLeft) {
			scrollToTimelineXOffset(scrollPos);
		}
	}

	if (direction === 'fit-right') {
		const currentFrameRight = calculateFrameWhileScrollingRight({
			durationInFrames,
			scrollLeft,
			width,
		});

		const scrollPos = getScrollPositionForCursorOnRightEdge({
			nextFrame: frame,
			durationInFrames,
		});
		const needsToScrollRight =
			scrollPos >=
			getScrollPositionForCursorOnRightEdge({
				nextFrame: currentFrameRight,
				durationInFrames,
			});
		if (needsToScrollRight) {
			scrollToTimelineXOffset(scrollPos);
		}
	}

	if (direction === 'page-right' || direction === 'page-left') {
		if (!isCursorInViewport({frame, durationInFrames})) {
			scrollToTimelineXOffset(
				direction === 'page-left'
					? getScrollPositionForCursorOnRightEdge({
							nextFrame: frame,
							durationInFrames,
						})
					: getScrollPositionForCursorOnLeftEdge({
							nextFrame: frame,
							durationInFrames,
						}),
			);
		}
	}

	if (direction === 'center') {
		const scrollPosOnRightEdge = getScrollPositionForCursorOnRightEdge({
			nextFrame: frame,
			durationInFrames,
		});
		const scrollPosOnLeftEdge = getScrollPositionForCursorOnLeftEdge({
			nextFrame: frame,
			durationInFrames,
		});
		scrollToTimelineXOffset((scrollPosOnLeftEdge + scrollPosOnRightEdge) / 2);
	}
};

export const scrollToTimelineXOffset = (scrollPos: number) => {
	scrollableRef.current?.scroll({
		left: scrollPos,
	});
};

export const getScrollPositionForCursorOnLeftEdge = ({
	nextFrame,
	durationInFrames,
}: {
	nextFrame: number;
	durationInFrames: number;
}) => {
	const frameIncrement = getFrameIncrement(durationInFrames);
	const scrollPos = frameIncrement * nextFrame;
	return scrollPos;
};

export const getScrollPositionForCursorOnRightEdge = ({
	nextFrame,
	durationInFrames,
}: {
	nextFrame: number;
	durationInFrames: number;
}) => {
	const frameIncrement = getFrameIncrement(durationInFrames);
	const framesRemaining = durationInFrames - 1 - nextFrame;

	const fromRight = framesRemaining * frameIncrement + TIMELINE_PADDING;

	const scrollPos =
		(scrollableRef.current?.scrollWidth as number) -
		fromRight -
		(scrollableRef.current?.clientWidth as number) +
		TIMELINE_PADDING +
		4; // clearfix;

	return scrollPos;
};

const getFrameIncrement = (durationInFrames: number) => {
	const width = scrollableRef.current?.scrollWidth ?? 0;
	return getFrameIncrementFromWidth(durationInFrames, width);
};

export const getFrameIncrementFromWidth = (
	durationInFrames: number,
	width: number,
) => {
	return (width - TIMELINE_PADDING * 2) / (durationInFrames - 1);
};

export const getFrameWhileScrollingRight = ({
	durationInFrames,
	width,
}: {
	durationInFrames: number;
	width: number;
}) => {
	const nextFrame = calculateFrameWhileScrollingRight({
		durationInFrames,
		width,
		scrollLeft:
			(scrollableRef.current?.scrollLeft as number) + SCROLL_INCREMENT,
	});
	const currentFrame = calculateFrameWhileScrollingRight({
		durationInFrames,
		width,
		scrollLeft: scrollableRef.current?.scrollLeft as number,
	});

	// Should scroll by at least 1 frame, but not overshoot duration
	return Math.min(durationInFrames - 1, Math.max(nextFrame, currentFrame + 1));
};

export const getFrameFromX = ({
	clientX,
	durationInFrames,
	width,
	extrapolate,
}: {
	clientX: number;
	durationInFrames: number;
	width: number;
	extrapolate: 'clamp' | 'extend';
}) => {
	const pos = clientX - TIMELINE_PADDING;
	const frame = Math.round(
		interpolate(
			pos,
			[0, width - TIMELINE_PADDING * 2],
			[0, durationInFrames - 1],
			{
				extrapolateLeft: extrapolate,
				extrapolateRight: extrapolate,
			},
		),
	);
	return frame;
};

export const zoomAndPreserveCursor = ({
	oldZoom,
	newZoom,
	currentFrame,
	currentDurationInFrames,
}: {
	oldZoom: number;
	newZoom: number;
	currentFrame: number;
	currentDurationInFrames: number;
}) => {
	const ratio = newZoom / oldZoom;
	if (ratio === 1) {
		return;
	}

	const {current} = scrollableRef;

	if (!current) {
		return;
	}

	const frameIncrement = getFrameIncrement(currentDurationInFrames);
	const prevCursorPosition = frameIncrement * currentFrame + TIMELINE_PADDING;

	const newCursorPosition =
		ratio * (prevCursorPosition - TIMELINE_PADDING) + TIMELINE_PADDING;

	current.scrollLeft += newCursorPosition - prevCursorPosition;
	redrawTimelineSliderFast.current?.draw(
		currentFrame,
		(scrollableRef.current?.clientWidth ?? 0) * ratio,
	);
};
