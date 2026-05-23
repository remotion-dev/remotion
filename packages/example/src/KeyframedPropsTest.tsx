import {blur} from '@remotion/effects/blur';
import {Gif} from '@remotion/gif';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const KeyframedPropsTest: React.FC = () => {
	const frame = useCurrentFrame();
	const blurRadius = interpolate(frame, [0, 60, 119], [0, 24, 4]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'space-evenly',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<Sequence
				durationInFrames={120}
				style={{scale: interpolate(frame, [0, 100], [2, 4])}}
			>
				<div
					style={{
						width: 180,
						height: 180,
						borderRadius: 24,
						backgroundColor: '#0b84f3',
					}}
				/>
			</Sequence>
			<Sequence durationInFrames={120}>
				<Gif
					src={staticFile('giphy.gif')}
					fit="contain"
					style={{
						width: 360,
						height: 200,
						borderRadius: 24,
						overflow: 'hidden',
					}}
					effects={[blur({radius: blurRadius})]}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};

export default KeyframedPropsTest;
