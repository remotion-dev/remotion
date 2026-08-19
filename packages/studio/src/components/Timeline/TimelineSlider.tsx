import React, {
	createRef,
	useContext,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {TIMELINE_PLAYHEAD_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {TIMELINE_MIN_ZOOM, TimelineZoomCtx} from '../../state/timeline-zoom';
import {getCurrentDuration, getCurrentFrame} from './imperative-state';
import {scrollableRef, sliderAreaRef} from './timeline-refs';
import {TimelineSliderHandle} from './TimelineSliderHandle';
import {TimelineWidthContext} from './TimelineWidthProvider';

const clippingContainer: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',
	height: '100vh',
	overflow: 'hidden',
	pointerEvents: 'none',
};

const slider: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	height: '100%',
};

const PLAYHEAD_LINE_WIDTH = 1;

const line: React.CSSProperties = {
	height: '100vh',
	width: PLAYHEAD_LINE_WIDTH,
	position: 'fixed',
	backgroundColor: TIMELINE_PLAYHEAD_COLOR,
};

const PLAYHEAD_CENTER_OFFSET = PLAYHEAD_LINE_WIDTH / 2;

const getTimelineSliderTransform = ({
	durationInFrames,
	frame,
	scrollLeft,
	width,
}: {
	durationInFrames: number;
	frame: number;
	scrollLeft: number;
	width: number;
}) => {
	const left = getXPositionOfItemInTimelineImperatively(
		frame,
		durationInFrames,
		width,
	);

	return `translateX(${left - scrollLeft - PLAYHEAD_CENTER_OFFSET}px)`;
};

export const redrawTimelineSliderFast = createRef<{
	draw: (frame: number, width?: number) => void;
}>();

export const TimelineSlider: React.FC = () => {
	const videoConfig = Internals.useUnsafeVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	if (videoConfig === null || timelineWidth === null) {
		return null;
	}

	return <TimelineSliderInner />;
};

const TimelineSliderInner: React.FC = () => {
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const ref = useRef<HTMLDivElement>(null);
	const timelineWidth = useContext(TimelineWidthContext);
	const {zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);

	if (timelineWidth === null) {
		throw new Error('Unexpectedly did not have timeline width');
	}

	const zoomLevel =
		canvasContent?.type === 'composition'
			? (zoomMap[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM)
			: TIMELINE_MIN_ZOOM;

	useLayoutEffect(() => {
		const el = ref.current;
		const measuredWidth = sliderAreaRef.current?.clientWidth;
		const scrollable = scrollableRef.current;
		if (
			!el ||
			!scrollable ||
			measuredWidth === undefined ||
			measuredWidth === 0
		) {
			return;
		}

		const draw = (frame: number) => {
			el.style.transform = getTimelineSliderTransform({
				durationInFrames: videoConfig.durationInFrames,
				frame,
				scrollLeft: scrollable.scrollLeft,
				width: measuredWidth,
			});
		};

		draw(timelinePosition);

		// Read the frame imperatively on scroll: during edge auto-scrolling, the
		// scroll event can fire before React has committed the seek, and drawing
		// with the stale `timelinePosition` closure makes the playhead flicker.
		const onScroll = () => draw(getCurrentFrame());
		scrollable.addEventListener('scroll', onScroll);
		return () => {
			scrollable.removeEventListener('scroll', onScroll);
		};
	}, [
		timelinePosition,
		videoConfig.durationInFrames,
		timelineWidth,
		zoomLevel,
	]);

	useImperativeHandle(redrawTimelineSliderFast, () => {
		return {
			draw: (frame, width?: number) => {
				const {current} = ref;
				if (!current) {
					throw new Error('unexpectedly did not have ref to timelineslider');
				}

				current.style.transform = getTimelineSliderTransform({
					durationInFrames: getCurrentDuration(),
					frame,
					scrollLeft: scrollableRef.current?.scrollLeft ?? 0,
					width: width ?? (sliderAreaRef.current?.clientWidth as number) ?? 0,
				});
			},
		};
	}, []);

	return (
		<div style={clippingContainer}>
			<div ref={ref} style={slider}>
				<div style={line} />
				<TimelineSliderHandle />
			</div>
		</div>
	);
};
