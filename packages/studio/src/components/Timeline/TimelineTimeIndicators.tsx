import type {Text} from 'pixi.js';
import React, {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	LIGHT_TEXT,
	TIMELINE_TRACK_SEPARATOR,
	WHITE_ALPHA_15,
} from '../../helpers/colors';
import {getStudioPixelRatio} from '../../helpers/studio-pixel-ratio';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {renderFrame} from '../../state/render-frame';
import {TimeValue} from '../TimeValue';
import type {TimelineCanvasDraw} from './pixi-timeline-renderer';
import {scrollableRef} from './timeline-refs';
import {getFrameIncrementFromWidth} from './timeline-scroll-logic';
import {useTimelineCanvasDrawing} from './TimelineCanvas';
import {TIMELINE_TICKS_BACKGROUND} from './TimelineSelection';
import {TimelineTickFormatContext} from './TimelineTickFormatProvider';
import {TimelineWidthContext} from './TimelineWidthProvider';

export const TIMELINE_TIME_INDICATOR_HEIGHT = 39;

const container: React.CSSProperties = {
	height: TIMELINE_TIME_INDICATOR_HEIGHT,
	position: 'absolute',
	backgroundColor: TIMELINE_TICKS_BACKGROUND,
	top: 0,
	borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

const TICK_LABEL_FONT_SIZE = 12;
const TICK_LABEL_MARGIN_LEFT = 8;
const TICK_LABEL_MIN_GAP = 16;
const MIN_SPACING_BETWEEN_FRAME_TICKS_PX = 5;
const MIN_SPACING_BETWEEN_TIME_TICKS_PX = 16;
const MIN_SPACING_BETWEEN_MEDIUM_FRAME_TICKS_PX = 24;
const MIN_SPACING_BETWEEN_MEDIUM_TIME_TICKS_PX = 48;

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

const TimelineTimeIndicatorsInner = React.memo<{
	readonly windowWidth: number;
	readonly fps: number;
	readonly durationInFrames: number;
}>(({windowWidth, durationInFrames, fps}) => {
	const ref = useRef<HTMLDivElement>(null);
	const {showFrames} = useContext(TimelineTickFormatContext);
	const settings = useMemo(() => {
		const frameInterval = getFrameIncrementFromWidth(
			durationInFrames,
			windowWidth,
		);
		const maxTickLabelWidth =
			(showFrames
				? `${durationInFrames - 1}f`
				: renderFrame(durationInFrames - 1, fps)
			).length *
			TICK_LABEL_FONT_SIZE *
			0.6;
		const tickScale = getTimelineTickScale({
			fps,
			frameInterval,
			rawSecondMarkerEveryNth:
				(TICK_LABEL_MARGIN_LEFT + maxTickLabelWidth + TICK_LABEL_MIN_GAP) /
				(frameInterval * fps),
		});
		return {
			durationInFrames,
			fps,
			frameInterval,
			maxTickLabelWidth,
			showFrames,
			tickScale,
		};
	}, [durationInFrames, fps, showFrames, windowWidth]);
	const drawing = useMemo((): TimelineCanvasDraw => {
		const labels = new Map<number, Text>();
		return {
			revision: settings,
			onScroll: true,
			// eslint-disable-next-line max-params
			draw: (
				graphics,
				nodeWidth,
				nodeHeight,
				resolveColor,
				TextConstructor,
				children,
			) => {
				const scrollable = scrollableRef.current;
				const element = ref.current;
				if (!scrollable || !element) {
					return;
				}

				const {
					durationInFrames: duration,
					fps: framesPerSecond,
					frameInterval,
					maxTickLabelWidth,
					showFrames: displayFrames,
					tickScale,
				} = settings;
				const computedStyle = getComputedStyle(element);
				const labelColor = resolveColor(LIGHT_TEXT);
				const {scrollLeft} = scrollable;
				const width = Math.min(nodeWidth, scrollable.clientWidth);
				const pixelRatio = getStudioPixelRatio();
				const visibleLabels = new Set<number>();
				graphics.rect(0, 0, width, nodeHeight).fill({
					color: resolveColor(TIMELINE_TICKS_BACKGROUND),
					alpha: 1,
				});
				graphics
					.rect(
						0,
						nodeHeight - TIMELINE_ITEM_BORDER_BOTTOM,
						width,
						TIMELINE_ITEM_BORDER_BOTTOM,
					)
					.fill({
						color: resolveColor(TIMELINE_TRACK_SEPARATOR),
						alpha: 1,
					});

				const firstFrame = Math.max(
					0,
					// Keep labels visible after their ticks scroll out of the viewport.
					Math.floor(
						(scrollLeft -
							TIMELINE_PADDING -
							TICK_LABEL_MARGIN_LEFT -
							maxTickLabelWidth) /
							frameInterval,
					),
				);
				const lastFrame = Math.min(
					duration - 1,
					Math.ceil((scrollLeft + width - TIMELINE_PADDING) / frameInterval),
				);
				const xForFrame = (frame: number) =>
					Math.round(frameInterval * frame + TIMELINE_PADDING - scrollLeft) +
					0.5;
				const drawTick = (frame: number, height: number) => {
					const x = xForFrame(frame);
					graphics.rect(x, 0, 1, height);
				};

				const firstLabelSecond =
					Math.ceil(
						firstFrame / framesPerSecond / tickScale.labelEverySeconds,
					) * tickScale.labelEverySeconds;
				const seconds = Math.floor(duration / framesPerSecond);
				for (
					let second = firstLabelSecond;
					second < seconds && second * framesPerSecond <= lastFrame;
					second += tickScale.labelEverySeconds
				) {
					const frame = second * framesPerSecond;
					drawTick(frame, 15);
					if (second > 0) {
						const text = displayFrames
							? `${Math.round(frame)}f`
							: renderFrame(frame, framesPerSecond);
						const x = xForFrame(frame) + TICK_LABEL_MARGIN_LEFT;
						let label = labels.get(second);
						if (!label || label.destroyed) {
							label = new TextConstructor({
								text,
								resolution: pixelRatio,
								style: {
									fontSize: TICK_LABEL_FONT_SIZE,
									fontFamily: computedStyle.fontFamily,
									fill: labelColor,
								},
							});
							children.addChild(label);
							labels.set(second, label);
						}

						label.text = text;
						if (label.resolution !== pixelRatio) {
							label.resolution = pixelRatio;
						}

						label.style.fontFamily = computedStyle.fontFamily;
						label.style.fill = labelColor;
						label.position.set(x, 7);
						visibleLabels.add(second);
					}
				}

				const {minorTickEvery, mediumTickEvery} = tickScale;
				if (minorTickEvery?.unit === 'frames') {
					const firstTick =
						Math.ceil(firstFrame / minorTickEvery.interval) *
						minorTickEvery.interval;
					for (
						let frame = firstTick;
						frame <= lastFrame;
						frame += minorTickEvery.interval
					) {
						if (frame % (tickScale.labelEverySeconds * framesPerSecond) === 0) {
							continue;
						}

						drawTick(
							frame,
							(Number.isInteger(framesPerSecond) &&
								frame % framesPerSecond === 0) ||
								(mediumTickEvery?.unit === 'frames' &&
									frame % mediumTickEvery.interval === 0)
								? 5
								: 2,
						);
					}
				}

				if (minorTickEvery?.unit === 'seconds') {
					const firstSecond =
						Math.ceil(firstFrame / framesPerSecond / minorTickEvery.interval) *
						minorTickEvery.interval;
					for (
						let second = firstSecond;
						second < seconds && second * framesPerSecond <= lastFrame;
						second += minorTickEvery.interval
					) {
						if (second % tickScale.labelEverySeconds === 0) {
							continue;
						}

						drawTick(
							second * framesPerSecond,
							mediumTickEvery?.unit === 'seconds' &&
								second % mediumTickEvery.interval === 0
								? 5
								: 2,
						);
					}
				}

				graphics.fill({color: resolveColor(WHITE_ALPHA_15), alpha: 1});
				for (const [second, label] of labels) {
					if (!visibleLabels.has(second)) {
						label.destroy({style: true});
						labels.delete(second);
					}
				}
			},
		};
	}, [settings]);
	useTimelineCanvasDrawing(ref, drawing);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...container,
			backgroundColor: 'transparent',
			borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid transparent`,
			width: windowWidth,
			minWidth: '100%',
			overflow: 'hidden',
			pointerEvents: 'none',
		};
	}, [windowWidth]);

	return <div ref={ref} style={style} />;
});
