import {PlayerInternals} from '@remotion/player';
import React, {useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	LIGHT_TEXT,
	TIMELINE_BACKGROUND,
} from '../../helpers/colors';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {renderFrame} from '../../state/render-frame';
import {TimeValue} from '../TimeValue';
import {sliderAreaRef, timelineVerticalScroll} from './timeline-refs';
import {getFrameIncrement} from './timeline-scroll-logic';
import {TOTAL_TIMELINE_LAYER_LEFT_PADDING} from './TimelineListItem';

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

const tickLabel: React.CSSProperties = {
	fontSize: 13,
	marginLeft: 8,
	marginTop: 3,
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

export const TimelineTimeIndicators: React.FC = () => {
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const video = Internals.useVideo();

	const windowWidth = size?.width ?? 0;

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
		};
	}, [windowWidth]);

	if (!video) {
		return null;
	}

	const frameInterval = getFrameIncrement(video.durationInFrames);

	const seconds = Math.floor(video.durationInFrames / video.fps);

	const secondTicks = new Array(seconds).fill(true).map((_, index) => {
		return {
			frame: index * video.fps,
			left: frameInterval * index * video.fps + TIMELINE_PADDING,
		};
	});

	return (
		<div ref={ref} style={style}>
			{secondTicks.map((t) => {
				return (
					<div
						key={t.frame}
						style={{
							...tick,
							left: t.left,
						}}
					>
						<div style={tickLabel}>{renderFrame(t.frame, video.fps)}</div>
					</div>
				);
			})}
		</div>
	);
};
