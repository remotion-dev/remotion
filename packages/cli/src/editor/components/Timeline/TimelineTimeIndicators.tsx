import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	LIGHT_TEXT,
	TIMELINE_BACKGROUND,
} from '../../helpers/colors';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {renderFrame} from '../../state/render-frame';
import {TimeValue} from '../TimeValue';
import {timelineVerticalScroll} from './timeline-refs';
import {getFrameIncrementFromWidth} from './timeline-scroll-logic';
import {TOTAL_TIMELINE_LAYER_LEFT_PADDING} from './TimelineListItem';
import {TimelineWidthContext} from './TimelineWidthProvider';

export const TIMELINE_TIME_INDICATOR_HEIGHT = 30;

const container: React.CSSProperties = {
	height: TIMELINE_TIME_INDICATOR_HEIGHT - 4,
	boxShadow: `0 0 4px ${TIMELINE_BACKGROUND}`,
	position: 'absolute',
	backgroundColor: TIMELINE_BACKGROUND,
	top: 0,
	left: 0,
};

const tick: React.CSSProperties = {
	width: 1,
	backgroundColor: 'rgba(255, 255, 255, 0.15)',
	height: 20,
	position: 'absolute',
};

const secondTick: React.CSSProperties = {
	...tick,
	height: 15,
};

const tickLabel: React.CSSProperties = {
	fontSize: 12,
	marginLeft: 8,
	marginTop: 7,
	color: LIGHT_TEXT,
};

const timeValue: React.CSSProperties = {
	height: TIMELINE_TIME_INDICATOR_HEIGHT,
	position: 'absolute',
	top: 0,
	width: '100%',
	paddingLeft: TOTAL_TIMELINE_LAYER_LEFT_PADDING,
	boxShadow: `0 0 20px ${BACKGROUND}`,
	display: 'flex',
	alignItems: 'center',
	background: BACKGROUND,
};

export const TimelineTimePlaceholders: React.FC = () => {
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
		<div ref={ref} style={timeValue}>
			<TimeValue />
		</div>
	);
};

export const TimelineTimePadding: React.FC = () => {
	return (
		<div
			style={{
				height: TIMELINE_TIME_INDICATOR_HEIGHT,
			}}
		/>
	);
};

type TimelineTick = {
	frame: number;
	style: React.CSSProperties;
	showTime: boolean;
};

export const TimelineTimeIndicators: React.FC = () => {
	const sliderTrack = useContext(TimelineWidthContext);
	const video = Internals.useVideo();

	if (sliderTrack === null) {
		return null;
	}

	if (video === null) {
		return null;
	}

	return (
		<Inner
			durationInFrames={video.durationInFrames}
			fps={video.fps}
			windowWidth={sliderTrack}
		/>
	);
};

const Inner: React.FC<{
	windowWidth: number;
	fps: number;
	durationInFrames: number;
}> = ({windowWidth, durationInFrames, fps}) => {
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

	const style = useMemo(() => {
		return {
			...container,
			width: windowWidth,
			overflow: 'hidden',
		};
	}, [windowWidth]);

	const ticks: TimelineTick[] = useMemo(() => {
		const frameInterval = getFrameIncrementFromWidth(
			durationInFrames,
			windowWidth
		);

		const MIN_SPACING_BETWEEN_TICKS_PX = 5;

		const seconds = Math.floor(durationInFrames / fps);
		const secondMarkerEveryNth = Math.ceil(
			(MIN_SPACING_BETWEEN_TICKS_PX * fps) / (frameInterval * fps)
		);
		const frameMarkerEveryNth = Math.ceil(
			MIN_SPACING_BETWEEN_TICKS_PX / frameInterval
		);

		// Big ticks showing for every second
		const secondTicks: TimelineTick[] = new Array(seconds)
			.fill(true)
			.map((_, index) => {
				return {
					frame: index * fps,
					style: {
						...secondTick,
						left: frameInterval * index * fps + TIMELINE_PADDING,
					},
					showTime: index > 0,
				};
			})
			.filter((_, idx) => idx % secondMarkerEveryNth === 0);

		const frameTicks: TimelineTick[] = new Array(durationInFrames)
			.fill(true)
			.map((_, index) => {
				return {
					frame: index,
					style: {
						...tick,
						left: frameInterval * index + TIMELINE_PADDING,
						height:
							index % fps === 0
								? 10
								: (index / frameMarkerEveryNth) % 2 === 0
								? 5
								: 2,
					},
					showTime: false,
				};
			})
			.filter((_, idx) => idx % frameMarkerEveryNth === 0);

		// Merge and deduplicate ticks
		const hasTicks: number[] = [];
		return [...secondTicks, ...frameTicks].filter((t) => {
			const alreadyUsed = hasTicks.find((ht) => ht === t.frame) !== undefined;
			hasTicks.push(t.frame);
			return !alreadyUsed;
		});
	}, [durationInFrames, fps, windowWidth]);

	return (
		<div ref={ref} style={style}>
			{ticks.map((t) => {
				return (
					<div key={t.frame} style={t.style}>
						{t.showTime ? (
							<div style={tickLabel}>{renderFrame(t.frame, fps)}</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
};
