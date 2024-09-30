import React, {
	createRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {TimelineSliderHandle} from './TimelineSliderHandle';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {getCurrentDuration} from './imperative-state';
import {sliderAreaRef, timelineVerticalScroll} from './timeline-refs';

const container: React.CSSProperties = {
	position: 'absolute',
	bottom: 0,
	top: 0,
	pointerEvents: 'none',
};

const line: React.CSSProperties = {
	height: '100vh',
	width: 1,
	position: 'fixed',
	backgroundColor: '#f02c00',
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

	return <Inner />;
};

const Inner: React.FC = () => {
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const ref = useRef<HTMLDivElement>(null);
	const timelineWidth = useContext(TimelineWidthContext);

	if (timelineWidth === null) {
		throw new Error('Unexpectedly did not have timeline width');
	}

	const style: React.CSSProperties = useMemo(() => {
		const left = getXPositionOfItemInTimelineImperatively(
			timelinePosition,
			videoConfig.durationInFrames,
			timelineWidth,
		);
		return {
			...container,
			transform: `translateX(${left}px)`,
		};
	}, [timelinePosition, videoConfig.durationInFrames, timelineWidth]);

	useImperativeHandle(redrawTimelineSliderFast, () => {
		return {
			draw: (frame, width?: number) => {
				const {current} = ref;
				if (!current) {
					throw new Error('unexpectedly did not have ref to timelineslider');
				}

				current.style.transform = `translateX(${getXPositionOfItemInTimelineImperatively(
					frame,
					getCurrentDuration(),
					width ?? (sliderAreaRef.current?.clientWidth as number) ?? 0,
				)}px)`;
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
		<div ref={ref} style={style}>
			<div style={line} />
			<TimelineSliderHandle />
		</div>
	);
};
