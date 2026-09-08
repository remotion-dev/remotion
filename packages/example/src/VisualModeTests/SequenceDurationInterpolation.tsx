import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const SequenceContent: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				fontFamily: 'sans-serif',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 40,
					top: 40,
					fontSize: 32,
					color: 'white',
				}}
			>
				Sequence frame {frame} / {durationInFrames - 1}; hook duration:{' '}
				{durationInFrames}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 50,
					top: 150,
					bottom: 90,
					borderLeft: '4px solid #22c55e',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 50,
					bottom: 45,
					color: '#22c55e',
					fontSize: 24,
					translate: '-50% 0',
				}}
			>
				Expected final position
			</div>
			<Interactive.Div
				name="Sequence-duration interpolation"
				style={{
					position: 'absolute',
					left: 850,
					top: 290,
					width: 280,
					padding: 32,
					borderRadius: 20,
					backgroundColor: '#6366f1',
					color: 'white',
					fontSize: 30,
					fontWeight: 700,
					textAlign: 'center',
					translate: interpolate(
						frame,
						[0, durationInFrames - 1],
						['0px -50px', '-800px -50px'],
					),
				}}
			>
				Should reach the green line
			</Interactive.Div>
		</div>
	);
};

export const SequenceDurationInterpolation: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#111827'}}>
			<div
				style={{
					position: 'absolute',
					right: 40,
					top: 40,
					fontFamily: 'monospace',
					fontSize: 24,
					color: '#94a3b8',
				}}
			>
				Composition: 120 frames · Sequence: frames 30–89
			</div>
			<Sequence from={30} durationInFrames={60} name="60-frame sequence">
				<SequenceContent />
			</Sequence>
		</AbsoluteFill>
	);
};
