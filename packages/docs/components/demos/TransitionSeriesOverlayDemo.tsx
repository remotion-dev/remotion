import {LightLeak} from '@remotion/light-leaks';
import {TransitionSeries} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#0b84f3',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			A
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'pink',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			B
		</AbsoluteFill>
	);
};

export const TransitionSeriesOverlayDemoComp: React.FC<{
	readonly overlayDuration: number;
	readonly offset: number;
}> = ({overlayDuration, offset}) => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneA />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay
				durationInFrames={overlayDuration}
				offset={offset}
			>
				<LightLeak />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneB />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
