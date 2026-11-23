import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from '../../helpers/pointer-session';
import {useZIndex} from '../../state/z-index';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {setCurrentFrame} from './imperative-state';
import {
	scrollableRef,
	sliderAreaRef,
	timelineVerticalScroll,
} from './timeline-refs';
import type {
	TimelineEdgeAutoScroller,
	TimelineEdgeScrollDirections,
} from './timeline-scroll-logic';
import {
	getFrameFromX,
	getFrameWhileScrollingLeft,
	getFrameWhileScrollingRight,
	getScrollPositionForCursorOnLeftEdge,
	getScrollPositionForCursorOnRightEdge,
	getTimelineContentWidth,
	scrollToTimelineXOffset,
	startTimelineEdgeAutoScroll,
} from './timeline-scroll-logic';
import {TIMELINE_SCRUBBER_ATTR} from './TimelineSelection';
import {redrawTimelineSliderFast} from './TimelineSlider';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';
import {
	TimelineViewportWidthContext,
	TimelineWidthContext,
} from './TimelineWidthProvider';

const inner: React.CSSProperties = {
	overflowY: 'auto',
	overflowX: 'hidden',
};

const container: React.CSSProperties = {
	userSelect: 'none',
	WebkitUserSelect: 'none',
	position: 'absolute',
	height: '100%',
	top: 0,
};

const style: React.CSSProperties = {
	width: '100%',
	height: '100%',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	position: 'absolute',
};

const getTimelineX = (clientX: number) => {
	const scrollable = scrollableRef.current;
	return (
		clientX +
		(scrollable?.scrollLeft ?? 0) -
		(scrollable?.getBoundingClientRect().left ?? 0)
	);
};

export const TimelineDragHandler: React.FC = () => {
	const video = Internals.useUnsafeVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {canvasContent, currentAssetMetadata} = useContext(
		Internals.CompositionManager,
	);

	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			...container,
			width: timelineWidth ?? undefined,
			height: TIMELINE_TIME_INDICATOR_HEIGHT,
		};
	}, [timelineWidth]);

	const hasPlayableContent =
		canvasContent?.type === 'composition' ||
		(canvasContent?.type === 'asset' &&
			currentAssetMetadata?.asset === canvasContent.asset);
	if (!hasPlayableContent) {
		return null;
	}

	return (
		<div
			ref={sliderAreaRef}
			style={containerStyle}
			{...{[TIMELINE_SCRUBBER_ATTR]: true}}
		>
			{video ? <TimelineDragHandlerInnerMemo /> : null}
		</div>
	);
};

const TimelineDragHandlerInner: React.FC = () => {
	const videoConfig = useVideoConfig();
	const viewportWidth = useContext(TimelineViewportWidthContext);
	const {isHighestContext} = useZIndex();
	const seekFrame = Internals.Timeline.useTimelineSeekFrame();

	const [dragging, setDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: true;
				wasPlaying: boolean;
				button: number;
				pointerId: number;
				target: HTMLDivElement;
		  }
	>({
		dragging: false,
	});
	const {isPlaying, play, pause, seek} = PlayerInternals.usePlayerMethods();

	const autoScroller = useRef<TimelineEdgeAutoScroller | null>(null);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			if (!isHighestContext) {
				return;
			}

			if (!videoConfig) {
				return;
			}

			e.stopPropagation();

			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			forceSpecificCursor('default');

			const frame = getFrameFromX({
				clientX: getTimelineX(e.clientX),
				durationInFrames: videoConfig.durationInFrames,
				// Composition switches render before the new timeline width is
				// committed. Read the live width when seeking, not during render.
				width: getTimelineContentWidth(),
				extrapolate: 'clamp',
			});
			seek(frame);
			setDragging({
				dragging: true,
				wasPlaying: isPlaying(),
				button: e.button,
				pointerId: e.pointerId,
				target: e.currentTarget,
			});
			e.currentTarget.setPointerCapture?.(e.pointerId);
			pause();
		},
		[isHighestContext, videoConfig, seek, isPlaying, pause],
	);

	const onEdgeScrollTick = useCallback(
		(directions: TimelineEdgeScrollDirections) => {
			if (!videoConfig || directions.x === null) {
				return;
			}

			const width = getTimelineContentWidth();
			const nextFrame =
				directions.x === 'left'
					? getFrameWhileScrollingLeft({
							durationInFrames: videoConfig.durationInFrames,
							width,
						})
					: getFrameWhileScrollingRight({
							durationInFrames: videoConfig.durationInFrames,
							width,
						});

			const scrollPos =
				directions.x === 'left'
					? getScrollPositionForCursorOnLeftEdge({
							nextFrame,
							durationInFrames: videoConfig.durationInFrames,
						})
					: getScrollPositionForCursorOnRightEdge({
							nextFrame,
							durationInFrames: videoConfig.durationInFrames,
						});

			// Update the imperative frame and apply the scroll before drawing, so
			// every redraw (including the scroll event listener in TimelineSlider)
			// sees a consistent (frame, scrollLeft) pair. Otherwise the playhead
			// flickers between stale combinations while React commits the seek.
			setCurrentFrame(nextFrame);
			scrollToTimelineXOffset(scrollPos);
			redrawTimelineSliderFast.current?.draw(nextFrame);
			seek(nextFrame);
		},
		[videoConfig, seek],
	);

	const onPointerMoveScrubbing = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			const directions = autoScroller.current?.update(e) ?? {
				x: null,
				y: null,
			};

			// While edge auto-scrolling is active, the tick owns seeking
			if (directions.x !== null) {
				return;
			}

			const frame = getFrameFromX({
				clientX: getTimelineX(e.clientX),
				durationInFrames: videoConfig.durationInFrames,
				width: getTimelineContentWidth(),
				extrapolate: 'clamp',
			});

			seek(frame);
		},
		[videoConfig, dragging.dragging, seek],
	);

	const onPointerUpScrubbing = useCallback(
		(e: PointerEvent) => {
			autoScroller.current?.stop();
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';

			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			setDragging({
				dragging: false,
			});

			const frame = getFrameFromX({
				clientX: getTimelineX(e.clientX),
				durationInFrames: videoConfig.durationInFrames,
				width: getTimelineContentWidth(),
				extrapolate: 'clamp',
			});

			seekFrame((c) => {
				if (c[videoConfig.id] === frame) {
					return c;
				}

				const newObj = {...c, [videoConfig.id]: frame};
				Internals.persistCurrentFrame(newObj);
				return newObj;
			});

			if (dragging.wasPlaying) {
				play();
			}
		},
		[dragging, play, videoConfig, seekFrame],
	);

	const onPointerCancelScrubbing = useCallback(() => {
		autoScroller.current?.stop();
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		if (!dragging.dragging) {
			return;
		}

		setDragging({dragging: false});
		if (dragging.wasPlaying) {
			play();
		}
	}, [dragging, play]);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}

		const scroller = startTimelineEdgeAutoScroll({
			includeHorizontal: true,
			includeVertical: false,
			verticalTopOffset: 0,
			onTick: onEdgeScrollTick,
		});
		autoScroller.current = scroller;

		const endSession = startCapturedPointerSession({
			event: dragging,
			captureTarget: dragging.target,
			onMove: onPointerMoveScrubbing,
			onEnd: (reason, endEvent) => {
				stopForcingSpecificCursor();
				if (isPointerSessionRelease(reason, endEvent)) {
					onPointerUpScrubbing(endEvent);
				} else {
					onPointerCancelScrubbing();
				}
			},
		});

		return () => {
			scroller.stop();
			if (autoScroller.current === scroller) {
				autoScroller.current = null;
			}

			endSession();
		};
	}, [
		dragging,
		onEdgeScrollTick,
		onPointerCancelScrubbing,
		onPointerMoveScrubbing,
		onPointerUpScrubbing,
	]);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const currentRef = ref.current;
		if (!currentRef) {
			return;
		}

		const {current} = timelineVerticalScroll;
		if (!current) {
			return;
		}

		const onScroll = () => {
			currentRef.style.top = current.scrollTop + 'px';
		};

		current.addEventListener('scroll', onScroll);
		return () => {
			current.removeEventListener('scroll', onScroll);
		};
	}, []);

	return (
		<div
			ref={ref}
			style={{...style, minWidth: viewportWidth ?? 0}}
			onPointerDown={onPointerDown}
		>
			<div style={inner} className={VERTICAL_SCROLLBAR_CLASSNAME} />
		</div>
	);
};

const TimelineDragHandlerInnerMemo = React.memo(TimelineDragHandlerInner);
