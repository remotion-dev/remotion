import {PlayerInternals} from '@remotion/player';
import React, {useEffect, useRef} from 'react';
import {sliderAreaRef, timelineVerticalScroll} from './timeline-refs';

export const TIMELINE_TIME_INDICATOR_HEIGHT = 45;

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
		<div
			ref={ref}
			style={{
				height: TIMELINE_TIME_INDICATOR_HEIGHT,
				backgroundColor: 'green',
				position: 'absolute',
				top: 0,
				width: '100%',
			}}
		/>
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

	return (
		<div
			ref={ref}
			// TODO: Remove inline styles in this file
			style={{
				height: TIMELINE_TIME_INDICATOR_HEIGHT,
				backgroundColor: 'yellow',
				width: windowWidth,
				position: 'absolute',
				top: 0,
				left: 0,
			}}
		/>
	);
};
