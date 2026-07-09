import React, {
	createRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {TIMELINE_PLAYHEAD_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {TIMELINE_MIN_ZOOM, TimelineZoomCtx} from '../../state/timeline-zoom';
import {getCurrentDuration} from './imperative-state';
import {sliderAreaRef, timelineVerticalScroll} from './timeline-refs';
import {TimelineSliderHandle} from './TimelineSliderHandle';
import {TimelineWidthContext} from './TimelineWidthProvider';

const container: React.CSSProperties = {
	position: 'absolute',
	bottom: 0,
	top: 0,
	pointerEvents: 'none',
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
	width,
}: {
	durationInFrames: number;
	frame: number;
	width: number;
}) => {
	const left = getXPositionOfItemInTimelineImperatively(
		frame,
		durationInFrames,
		width,
	);

	return `translateX(${left - PLAYHEAD_CENTER_OFFSET}px)`;
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
		if (!el || measuredWidth === undefined || measuredWidth === 0) {
			return;
		}

		el.style.transform = getTimelineSliderTransform({
			durationInFrames: videoConfig.durationInFrames,
			frame: timelinePosition,
			width: measuredWidth,
		});
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
					width: width ?? (sliderAreaRef.current?.clientWidth as number) ?? 0,
				});
			},
		};
	}, []);

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
		<div ref={ref} style={container}>
			<div style={line} />
			<TimelineSliderHandle />
		</div>
	);
};
