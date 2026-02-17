import {LightLeak} from '@remotion/light-leaks';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Fill: React.FC<{color: string; label: string}> = ({color, label}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: color,
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 80,
				color: 'white',
				fontFamily: 'sans-serif',
			}}
		>
			{label}
		</AbsoluteFill>
	);
};

const Flash: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const opacity = interpolate(
		frame,
		[0, durationInFrames / 2, durationInFrames],
		[0, 1, 0],
	);
	return (
		<AbsoluteFill
			style={{
				backgroundColor: `rgba(255, 255, 255, ${opacity})`,
			}}
		/>
	);
};

/**
 * Basic overlay: a light leak effect between two scenes.
 */
export const OverlayBasic: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#e74c3c" label="Scene A" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={30}>
				<LightLeak seed={2} />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#3498db" label="Scene B" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

/**
 * Overlay with positive offset — the light leak is shifted later.
 */
export const OverlayWithOffset: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#2ecc71" label="Scene A" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={30} offset={10}>
				<LightLeak seed={5} hueShift={120} />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#9b59b6" label="Scene B" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

/**
 * Multiple overlays across three scenes.
 */
export const OverlayMultipleScenes: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#e74c3c" label="Scene 1" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Flash />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#3498db" label="Scene 2" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={30}>
				<LightLeak seed={7} hueShift={60} />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#2ecc71" label="Scene 3" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

/**
 * Mix of overlays and transitions in the same TransitionSeries
 * (not adjacent — that would be an error).
 */
export const OverlayAndTransitionMixed: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#e67e22" label="Scene A" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 15})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#1abc9c" label="Scene B" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={24}>
				<LightLeak seed={11} hueShift={200} />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="#8e44ad" label="Scene C" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
