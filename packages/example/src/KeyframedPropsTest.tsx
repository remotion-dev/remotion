import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';

const KeyframedPropsTest: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
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
		</AbsoluteFill>
	);
};

export default KeyframedPropsTest;
