import {interpolate} from 'remotion';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {setCurrentFrame} from './imperative-state';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {redrawTimelineSliderFast} from './TimelineSlider';

export const canScrollTimelineIntoDirection = () => {
	const current = scrollableRef.current as HTMLDivElement;
	const {scrollWidth, scrollLeft, clientWidth} = current;
	const canScrollRight =
		scrollWidth - scrollLeft - clientWidth > TIMELINE_PADDING;
	const canScrollLeft = scrollLeft > TIMELINE_PADDING;
	return {canScrollRight, canScrollLeft};
};

export const SCROLL_INCREMENT = 200;

export const EDGE_SCROLL_VERTICAL_INCREMENT = 60;

const EDGE_SCROLL_INTERVAL_MS = 100;

// Once edge-scrolling has started, the pointer must move this many pixels
// back inside the timeline to stop it. Prevents pixel jitter around the edge
// threshold from rapidly cancelling and restarting the auto-scroll.
const EDGE_SCROLL_EXIT_HYSTERESIS = 8;

// The vertical edge zones extend this many pixels into the viewport, so the
// auto-scroll already engages when dragging close to (not exactly onto) the
// top or bottom edge.
const EDGE_SCROLL_VERTICAL_INSET = 8;

export type TimelineEdgeScrollDirections = {
	x: 'left' | 'right' | null;
	y: 'up' | 'down' | null;
};

export type TimelineEdgeAutoScroller = {
	update: (e: {
		clientX: number;
		clientY: number;
	}) => TimelineEdgeScrollDirections;
	stop: () => void;
};

const canScrollTimelineVerticallyIntoDirection = () => {
	const {current} = timelineVerticalScroll;
	if (!current) {
		return {canScrollUp: false, canScrollDown: false};
	}

	const {scrollTop, scrollHeight, clientHeight} = current;
	return {
		canScrollUp: scrollTop > 0,
		canScrollDown: scrollHeight - scrollTop - clientHeight > 0,
	};
};

const getEdgeScrollDirections = ({
	clientX,
	clientY,
	includeHorizontal,
	includeVertical,
	verticalTopOffset,
	active,
}: {
	clientX: number;
	clientY: number;
	includeHorizontal: boolean;
	includeVertical: boolean;
	verticalTopOffset: number;
	active: TimelineEdgeScrollDirections;
}): TimelineEdgeScrollDirections => {
	let x: TimelineEdgeScrollDirections['x'] = null;
	const scrollable = scrollableRef.current;
	if (includeHorizontal && scrollable) {
		const rect = scrollable.getBoundingClientRect();
		const leftThreshold =
			rect.left + (active.x === 'left' ? EDGE_SCROLL_EXIT_HYSTERESIS : 0);
		const rightThreshold =
			rect.left +
			scrollable.clientWidth -
			TIMELINE_PADDING -
			(active.x === 'right' ? EDGE_SCROLL_EXIT_HYSTERESIS : 0);
		const {canScrollLeft, canScrollRight} = canScrollTimelineIntoDirection();
		if (clientX <= leftThreshold && canScrollLeft) {
			x = 'left';
		} else if (clientX >= rightThreshold && canScrollRight) {
			x = 'right';
		}
	}

	let y: TimelineEdgeScrollDirections['y'] = null;
	const vertical = timelineVerticalScroll.current;
	if (includeVertical && vertical) {
		const rect = vertical.getBoundingClientRect();
		const topThreshold =
			rect.top +
			verticalTopOffset +
			EDGE_SCROLL_VERTICAL_INSET +
			(active.y === 'up' ? EDGE_SCROLL_EXIT_HYSTERESIS : 0);
		const bottomThreshold =
			rect.bottom -
			EDGE_SCROLL_VERTICAL_INSET -
			(active.y === 'down' ? EDGE_SCROLL_EXIT_HYSTERESIS : 0);
		const {canScrollUp, canScrollDown} =
			canScrollTimelineVerticallyIntoDirection();
		if (clientY <= topThreshold && canScrollUp) {
			y = 'up';
		} else if (clientY >= bottomThreshold && canScrollDown) {
			y = 'down';
		}
	}

	return {x, y};
};

/**
 * Shared edge auto-scroll loop for drag gestures on the timeline (playhead
 * scrubbing, marquee selection, sequence reordering). Detects when the pointer
 * is in an edge zone and repeatedly invokes `onTick` while it stays there. The
 * consumer performs the actual scrolling (and any dependent updates) inside
 * `onTick`, so it can read a settled scroll position afterwards.
 */
export const startTimelineEdgeAutoScroll = ({
	includeHorizontal,
	includeVertical,
	verticalTopOffset,
	onTick,
}: {
	includeHorizontal: boolean;
	includeVertical: boolean;
	verticalTopOffset: number;
	onTick: (directions: TimelineEdgeScrollDirections) => void;
}): TimelineEdgeAutoScroller => {
	let active: TimelineEdgeScrollDirections = {x: null, y: null};
	let lastPointer: {clientX: number; clientY: number} | null = null;
	let interval: ReturnType<typeof setInterval> | null = null;

	const stopInterval = () => {
		if (interval !== null) {
			clearInterval(interval);
			interval = null;
		}
	};

	const tick = () => {
		if (lastPointer === null) {
			return;
		}

		active = getEdgeScrollDirections({
			clientX: lastPointer.clientX,
			clientY: lastPointer.clientY,
			includeHorizontal,
			includeVertical,
			verticalTopOffset,
			active,
		});
		if (active.x === null && active.y === null) {
			stopInterval();
			return;
		}

		onTick(active);
	};

	const update = (e: {clientX: number; clientY: number}) => {
		lastPointer = {clientX: e.clientX, clientY: e.clientY};
		active = getEdgeScrollDirections({
			clientX: e.clientX,
			clientY: e.clientY,
			includeHorizontal,
			includeVertical,
			verticalTopOffset,
			active,
		});

		if (active.x !== null || active.y !== null) {
			if (interval === null) {
				onTick(active);
				interval = setInterval(tick, EDGE_SCROLL_INTERVAL_MS);
			}
		} else {
			stopInterval();
		}

		return active;
	};

	const stop = () => {
		stopInterval();
		lastPointer = null;
		active = {x: null, y: null};
	};

	return {update, stop};
};

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
	// Sync the imperative frame first: scrolling below triggers the scroll
	// listener in TimelineSlider, which reads the frame imperatively.
	setCurrentFrame(frame);
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
	return getUsableTimelineWidth(width) / durationInFrames;
};

const getUsableTimelineWidth = (width: number) => {
	return Math.max(1, width - TIMELINE_PADDING * 2);
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
	const frame = Math.min(
		durationInFrames - 1,
		Math.round(
			interpolate(
				pos,
				[0, getUsableTimelineWidth(width)],
				[0, durationInFrames],
				{
					extrapolateLeft: extrapolate,
					extrapolateRight: extrapolate,
				},
			),
		),
	);
	return frame;
};

export const getFrameFromTimelineDrop = ({
	clientX,
	durationInFrames,
	scrollLeft,
	timelineLeft,
	timelineWidth,
}: {
	clientX: number;
	durationInFrames: number;
	scrollLeft: number;
	timelineLeft: number;
	timelineWidth: number;
}) => {
	return getFrameFromX({
		clientX: clientX - timelineLeft + scrollLeft,
		durationInFrames,
		width: timelineWidth,
		extrapolate: 'clamp',
	});
};

/**
 * Horizontal position inside the scrollable timeline content (0 … scrollWidth)
 * for a viewport `clientX`, so pinch-anchoring matches the pointer (not a
 * rounded frame index).
 */
export const viewportClientXToScrollContentX = ({
	clientX,
	scrollEl,
}: {
	clientX: number;
	scrollEl: HTMLDivElement;
}) => {
	const rect = scrollEl.getBoundingClientRect();
	const clampedClientX = Math.min(Math.max(clientX, rect.left), rect.right);

	return clampedClientX + scrollEl.scrollLeft - rect.left;
};

export const getScrollLeftToKeepCursorInPlace = ({
	anchorContentX,
	oldScrollLeft,
	oldTimelineWidth,
	newTimelineWidth,
}: {
	anchorContentX: number;
	oldScrollLeft: number;
	oldTimelineWidth: number;
	newTimelineWidth: number;
}) => {
	const oldUsableWidth = getUsableTimelineWidth(oldTimelineWidth);
	const newUsableWidth = getUsableTimelineWidth(newTimelineWidth);
	const clampedAnchorContentX = Math.min(
		Math.max(anchorContentX, TIMELINE_PADDING),
		TIMELINE_PADDING + oldUsableWidth,
	);
	const cursorX = clampedAnchorContentX - oldScrollLeft;
	const anchorInUsableWidth = clampedAnchorContentX - TIMELINE_PADDING;
	const newAnchorContentX =
		TIMELINE_PADDING + (anchorInUsableWidth / oldUsableWidth) * newUsableWidth;

	return newAnchorContentX - cursorX;
};

export const prepareToPreserveTimelineCursor = ({
	currentFrame,
	currentDurationInFrames,
	anchorFrame,
	anchorContentX,
}: {
	currentFrame: number;
	currentDurationInFrames: number;
	anchorFrame: number | null;
	/** Prefer this over `anchorFrame` when not null (subpixel-accurate anchor). */
	anchorContentX: number | null;
}) => {
	const {current} = scrollableRef;

	if (!current) {
		return () => undefined;
	}

	const oldTimelineWidth = current.scrollWidth;
	const oldScrollLeft = current.scrollLeft;
	const frameIncrement = getFrameIncrementFromWidth(
		currentDurationInFrames,
		oldTimelineWidth,
	);
	const frameForScroll = anchorFrame ?? currentFrame;
	const prevCursorPosition =
		anchorContentX !== null
			? anchorContentX
			: frameIncrement * frameForScroll + TIMELINE_PADDING;

	return () => {
		if (scrollableRef.current !== current) {
			return;
		}

		current.scrollLeft = getScrollLeftToKeepCursorInPlace({
			anchorContentX: prevCursorPosition,
			oldScrollLeft,
			oldTimelineWidth,
			newTimelineWidth: current.scrollWidth,
		});
	};
};
