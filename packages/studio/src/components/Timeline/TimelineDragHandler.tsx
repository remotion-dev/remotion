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
import {isStudioSelectionEnabled} from '../../helpers/interactivity-enabled';
import {startPointerSession} from '../../helpers/pointer-session';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {TIMELINE_MIN_ZOOM, TimelineZoomCtx} from '../../state/timeline-zoom';
import {useZIndex} from '../../state/z-index';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	scrollableRef,
	sliderAreaRef,
	timelineVerticalScroll,
} from './timeline-refs';
import {
	canScrollTimelineIntoDirection,
	getFrameFromX,
	getFrameWhileScrollingLeft,
	getFrameWhileScrollingRight,
	getScrollPositionForCursorOnLeftEdge,
	getScrollPositionForCursorOnRightEdge,
	scrollToTimelineXOffset,
} from './timeline-scroll-logic';
import {TIMELINE_SCRUBBER_ATTR} from './TimelineSelection';
import {redrawTimelineSliderFast} from './TimelineSlider';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';

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

const getClientXWithScroll = (x: number) => {
	return x + (scrollableRef.current?.scrollLeft as number);
};

export const TimelineDragHandler: React.FC = () => {
	const video = Internals.useUnsafeVideoConfig();

	const {zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!canvasContent || canvasContent.type !== 'composition') {
			return {};
		}

		const zoom = zoomMap[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM;
		return {
			...container,
			width: 100 * zoom + '%',
			height: TIMELINE_TIME_INDICATOR_HEIGHT,
		};
	}, [canvasContent, zoomMap]);

	if (!canvasContent || canvasContent.type !== 'composition') {
		return null;
	}

	return (
		<div
			ref={sliderAreaRef}
			style={containerStyle}
			{...{[TIMELINE_SCRUBBER_ATTR]: true}}
		>
			{video && isStudioSelectionEnabled() ? (
				<TimelineDragHandlerInnerMemo />
			) : null}
		</div>
	);
};

const TimelineDragHandlerInner: React.FC = () => {
	const videoConfig = useVideoConfig();
	const size = PlayerInternals.useElementSize(scrollableRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const {isHighestContext} = useZIndex();
	const setFrame = Internals.useTimelineSetFrame();

	const width = scrollableRef.current?.scrollWidth ?? 0;
	const left = size?.left ?? 0;

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

	const scroller = useRef<Timer | null>(null);

	const stopInterval = () => {
		if (scroller.current) {
			clearInterval(scroller.current);
			scroller.current = null;
		}
	};

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			if (!isHighestContext) {
				return;
			}

			stopInterval();
			if (!videoConfig) {
				return;
			}

			e.stopPropagation();

			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';

			const frame = getFrameFromX({
				clientX: getClientXWithScroll(e.clientX) - left,
				durationInFrames: videoConfig.durationInFrames,
				width,
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
		[isHighestContext, videoConfig, left, width, seek, isPlaying, pause],
	);

	const onPointerMoveScrubbing = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			const isRightOfArea =
				e.clientX >=
				(scrollableRef.current?.clientWidth as number) +
					left -
					TIMELINE_PADDING;

			const isLeftOfArea = e.clientX <= left;

			const frame = getFrameFromX({
				clientX: getClientXWithScroll(e.clientX) - left,
				durationInFrames: videoConfig.durationInFrames,
				width,
				extrapolate: 'clamp',
			});

			if (isLeftOfArea && canScrollTimelineIntoDirection().canScrollLeft) {
				if (scroller.current) {
					return;
				}

				const scrollEvery = () => {
					if (!canScrollTimelineIntoDirection().canScrollLeft) {
						stopInterval();
						return;
					}

					const nextFrame = getFrameWhileScrollingLeft({
						durationInFrames: videoConfig.durationInFrames,
						width,
					});

					const scrollPos = getScrollPositionForCursorOnLeftEdge({
						nextFrame,
						durationInFrames: videoConfig.durationInFrames,
					});

					redrawTimelineSliderFast.current?.draw(nextFrame);
					seek(nextFrame);
					scrollToTimelineXOffset(scrollPos);
				};

				scrollEvery();
				scroller.current = setInterval(() => {
					scrollEvery();
				}, 100);
			} else if (
				isRightOfArea &&
				canScrollTimelineIntoDirection().canScrollRight
			) {
				if (scroller.current) {
					return;
				}

				const scrollEvery = () => {
					if (!canScrollTimelineIntoDirection().canScrollRight) {
						stopInterval();
						return;
					}

					const nextFrame = getFrameWhileScrollingRight({
						durationInFrames: videoConfig.durationInFrames,
						width,
					});

					const scrollPos = getScrollPositionForCursorOnRightEdge({
						nextFrame,
						durationInFrames: videoConfig.durationInFrames,
					});

					redrawTimelineSliderFast.current?.draw(nextFrame);
					seek(nextFrame);
					scrollToTimelineXOffset(scrollPos);
				};

				scrollEvery();

				scroller.current = setInterval(() => {
					scrollEvery();
				}, 100);
			} else {
				stopInterval();
				seek(frame);
			}
		},
		[videoConfig, dragging.dragging, left, width, seek],
	);

	const onPointerUpScrubbing = useCallback(
		(e: PointerEvent) => {
			stopInterval();
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
				clientX: getClientXWithScroll(e.clientX) - left,
				durationInFrames: videoConfig.durationInFrames,
				width,
				extrapolate: 'clamp',
			});

			setFrame((c) => {
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
		[dragging, left, play, videoConfig, setFrame, width],
	);

	const onPointerCancelScrubbing = useCallback(() => {
		stopInterval();
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

		return startPointerSession({
			event: dragging,
			target: dragging.target,
			onMove: onPointerMoveScrubbing,
			onEnd: (reason, endEvent) => {
				if (
					(reason === 'pointerup' || reason === 'buttons-released') &&
					endEvent
				) {
					onPointerUpScrubbing(endEvent);
				} else {
					onPointerCancelScrubbing();
				}
			},
		});
	}, [
		dragging,
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
		<div ref={ref} style={style} onPointerDown={onPointerDown}>
			<div style={inner} className={VERTICAL_SCROLLBAR_CLASSNAME} />
		</div>
	);
};

const TimelineDragHandlerInnerMemo = React.memo(TimelineDragHandlerInner);
