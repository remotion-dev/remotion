import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	LIGHT_TEXT,
	TIMELINE_TRACK_SEPARATOR,
	WHITE_ALPHA_15,
} from '../../helpers/colors';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {renderFrame} from '../../state/render-frame';
import {TimeValue} from '../TimeValue';
import {timelineVerticalScroll} from './timeline-refs';
import {getFrameIncrementFromWidth} from './timeline-scroll-logic';
import {TIMELINE_TICKS_BACKGROUND} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

export const TIMELINE_TIME_INDICATOR_HEIGHT = 39;

const container: React.CSSProperties = {
	height: TIMELINE_TIME_INDICATOR_HEIGHT,
	position: 'absolute',
	backgroundColor: TIMELINE_TICKS_BACKGROUND,
	top: 0,
	borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

const tick: React.CSSProperties = {
	width: 1,
	backgroundColor: WHITE_ALPHA_15,
	height: 20,
	position: 'absolute',
};

const secondTick: React.CSSProperties = {
	...tick,
	height: 15,
};

const TICK_LABEL_FONT_SIZE = 12;
const TICK_LABEL_MARGIN_LEFT = 8;
const TICK_LABEL_MIN_GAP = 16;
const MIN_SPACING_BETWEEN_FRAME_TICKS_PX = 5;
const MIN_SPACING_BETWEEN_TIME_TICKS_PX = 16;
const MIN_SPACING_BETWEEN_MEDIUM_FRAME_TICKS_PX = 24;
const MIN_SPACING_BETWEEN_MEDIUM_TIME_TICKS_PX = 48;

const tickLabel: React.CSSProperties = {
	fontSize: TICK_LABEL_FONT_SIZE,
	marginLeft: TICK_LABEL_MARGIN_LEFT,
	marginTop: 7,
	color: LIGHT_TEXT,
};

const timeValue: React.CSSProperties = {
	height: TIMELINE_TIME_INDICATOR_HEIGHT,
	position: 'absolute',
	top: 0,
	width: 'calc(100% + 1.5px)',
	paddingLeft: 10,
	display: 'flex',
	alignItems: 'center',
	backgroundColor: BACKGROUND,
	borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

export const TimelineTimePlaceholders: React.FC = () => {
	return (
		<div style={timeValue}>
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

const NICE_SECOND_INTERVALS = [
	1,
	2,
	5,
	10,
	15,
	30,
	60,
	2 * 60,
	3 * 60,
	5 * 60,
	10 * 60,
	15 * 60,
	20 * 60,
	30 * 60,
	60 * 60,
];

export const getNiceSecondInterval = (rawNthSecond: number): number => {
	for (const n of NICE_SECOND_INTERVALS) {
		if (n >= rawNthSecond) {
			return n;
		}
	}

	return Math.ceil(rawNthSecond / 3600) * 3600;
};

type TickInterval = {
	readonly interval: number;
	readonly unit: 'frames' | 'seconds';
};

export type TimelineTickScale = {
	readonly labelEverySeconds: number;
	readonly mediumTickEvery: TickInterval | null;
	readonly minorTickEvery: TickInterval | null;
};

const getIntegerDivisors = (value: number): number[] => {
	const lowerDivisors: number[] = [];
	const upperDivisors: number[] = [];

	for (let candidate = 1; candidate <= Math.sqrt(value); candidate++) {
		if (value % candidate !== 0) {
			continue;
		}

		lowerDivisors.push(candidate);
		if (candidate !== value / candidate) {
			upperDivisors.unshift(value / candidate);
		}
	}

	return [...lowerDivisors, ...upperDivisors];
};

const getFrameIntervals = (fps: number): number[] => {
	if (Number.isInteger(fps)) {
		return getIntegerDivisors(fps);
	}

	return [1, 2, 5, 10, 15, 20, 30, 60].filter((interval) => interval < fps);
};

const getSecondIntervals = (labelEverySeconds: number): number[] => {
	const hourlyIntervals = getIntegerDivisors(labelEverySeconds / 3600).map(
		(hours) => hours * 3600,
	);

	return [...new Set([...NICE_SECOND_INTERVALS, ...hourlyIntervals])].sort(
		(a, b) => a - b,
	);
};

export const getTimelineTickScale = ({
	fps,
	frameInterval,
	rawSecondMarkerEveryNth,
}: {
	readonly fps: number;
	readonly frameInterval: number;
	readonly rawSecondMarkerEveryNth: number;
}): TimelineTickScale => {
	const labelEverySeconds = getNiceSecondInterval(rawSecondMarkerEveryNth);
	const frameIntervals = getFrameIntervals(fps);
	const rawFrameInterval = MIN_SPACING_BETWEEN_FRAME_TICKS_PX / frameInterval;
	const minorFrameInterval = frameIntervals.find(
		(interval) => interval >= rawFrameInterval && interval < fps,
	);

	if (minorFrameInterval !== undefined) {
		const rawMediumFrameInterval =
			MIN_SPACING_BETWEEN_MEDIUM_FRAME_TICKS_PX / frameInterval;
		const mediumFrameInterval = frameIntervals.find(
			(interval) =>
				interval >= rawMediumFrameInterval &&
				interval < fps &&
				interval % minorFrameInterval === 0,
		);

		return {
			labelEverySeconds,
			mediumTickEvery:
				mediumFrameInterval === undefined
					? null
					: {interval: mediumFrameInterval, unit: 'frames'},
			minorTickEvery: {interval: minorFrameInterval, unit: 'frames'},
		};
	}

	const pixelsPerSecond = frameInterval * fps;
	const secondIntervals = getSecondIntervals(labelEverySeconds);
	const rawMinorSecondInterval =
		MIN_SPACING_BETWEEN_TIME_TICKS_PX / pixelsPerSecond;
	const minorSecondInterval = secondIntervals.find(
		(interval) =>
			interval >= rawMinorSecondInterval &&
			interval < labelEverySeconds &&
			labelEverySeconds % interval === 0,
	);

	if (minorSecondInterval === undefined) {
		return {
			labelEverySeconds,
			mediumTickEvery: null,
			minorTickEvery: null,
		};
	}

	const rawMediumSecondInterval =
		MIN_SPACING_BETWEEN_MEDIUM_TIME_TICKS_PX / pixelsPerSecond;
	const mediumSecondInterval = secondIntervals.find(
		(interval) =>
			interval >= rawMediumSecondInterval &&
			interval < labelEverySeconds &&
			interval % minorSecondInterval === 0 &&
			labelEverySeconds % interval === 0,
	);

	return {
		labelEverySeconds,
		mediumTickEvery:
			mediumSecondInterval === undefined
				? null
				: {interval: mediumSecondInterval, unit: 'seconds'},
		minorTickEvery: {interval: minorSecondInterval, unit: 'seconds'},
	};
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
		<TimelineTimeIndicatorsInner
			durationInFrames={video.durationInFrames}
			fps={video.fps}
			windowWidth={sliderTrack}
		/>
	);
};

const TimelineTimeIndicatorsInner: React.FC<{
	readonly windowWidth: number;
	readonly fps: number;
	readonly durationInFrames: number;
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

	const style: React.CSSProperties = useMemo(() => {
		return {
			...container,
			width: windowWidth,
			overflow: 'hidden',
			pointerEvents: 'none',
		};
	}, [windowWidth]);

	const ticks: TimelineTick[] = useMemo(() => {
		const frameInterval = getFrameIncrementFromWidth(
			durationInFrames,
			windowWidth,
		);

		const maxTickLabelWidth =
			renderFrame(durationInFrames - 1, fps).length *
			TICK_LABEL_FONT_SIZE *
			0.6;
		const minSpacingBetweenTickLabelsPx =
			TICK_LABEL_MARGIN_LEFT + maxTickLabelWidth + TICK_LABEL_MIN_GAP;

		const seconds = Math.floor(durationInFrames / fps);
		const rawSecondMarkerEveryNth =
			minSpacingBetweenTickLabelsPx / (frameInterval * fps);
		const tickScale = getTimelineTickScale({
			fps,
			frameInterval,
			rawSecondMarkerEveryNth,
		});

		// Labeled ticks use human-friendly time intervals.
		const secondTicks: TimelineTick[] = [];
		for (let index = 0; index < seconds; index += tickScale.labelEverySeconds) {
			secondTicks.push({
				frame: index * fps,
				style: {
					...secondTick,
					left: frameInterval * index * fps + TIMELINE_PADDING,
				},
				showTime: index > 0,
			});
		}

		const hasSecondTick = new Set(secondTicks.map((t) => t.frame));
		const subdivisionTicks: TimelineTick[] = [];
		const {minorTickEvery, mediumTickEvery} = tickScale;

		if (minorTickEvery?.unit === 'frames') {
			for (
				let frame = 0;
				frame < durationInFrames;
				frame += minorTickEvery.interval
			) {
				if (hasSecondTick.has(frame)) {
					continue;
				}

				subdivisionTicks.push({
					frame,
					style: {
						...tick,
						left: frameInterval * frame + TIMELINE_PADDING,
						height:
							(Number.isInteger(fps) && frame % fps === 0) ||
							(mediumTickEvery?.unit === 'frames' &&
								frame % mediumTickEvery.interval === 0)
								? 5
								: 2,
					},
					showTime: false,
				});
			}
		}

		if (minorTickEvery?.unit === 'seconds') {
			for (
				let second = 0;
				second < seconds;
				second += minorTickEvery.interval
			) {
				const frame = second * fps;
				if (hasSecondTick.has(frame)) {
					continue;
				}

				subdivisionTicks.push({
					frame,
					style: {
						...tick,
						left: frameInterval * frame + TIMELINE_PADDING,
						height:
							mediumTickEvery?.unit === 'seconds' &&
							second % mediumTickEvery.interval === 0
								? 5
								: 2,
					},
					showTime: false,
				});
			}
		}

		return [...secondTicks, ...subdivisionTicks];
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
