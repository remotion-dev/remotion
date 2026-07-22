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

		const MIN_SPACING_BETWEEN_TICKS_PX = 5;
		const maxTickLabelWidth =
			renderFrame(durationInFrames - 1, fps).length *
			TICK_LABEL_FONT_SIZE *
			0.6;
		const minSpacingBetweenTickLabelsPx =
			TICK_LABEL_MARGIN_LEFT + maxTickLabelWidth + TICK_LABEL_MIN_GAP;

		const seconds = Math.floor(durationInFrames / fps);
		const rawSecondMarkerEveryNth =
			minSpacingBetweenTickLabelsPx / (frameInterval * fps);
		const secondMarkerEveryNth = getNiceSecondInterval(rawSecondMarkerEveryNth);
		const frameMarkerEveryNth = Math.ceil(
			MIN_SPACING_BETWEEN_TICKS_PX / frameInterval,
		);

		// Big ticks showing for every second, stepping directly by the interval
		const secondTicks: TimelineTick[] = [];
		for (let index = 0; index < seconds; index += secondMarkerEveryNth) {
			secondTicks.push({
				frame: index * fps,
				style: {
					...secondTick,
					left: frameInterval * index * fps + TIMELINE_PADDING,
				},
				showTime: index > 0,
			});
		}

		// Frame-level ticks, stepping directly by the interval
		const hasSecondTick = new Set(secondTicks.map((t) => t.frame));
		const frameTicks: TimelineTick[] = [];
		for (
			let index = 0;
			index < durationInFrames;
			index += frameMarkerEveryNth
		) {
			if (hasSecondTick.has(index)) {
				continue;
			}

			frameTicks.push({
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
			});
		}

		return [...secondTicks, ...frameTicks];
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
