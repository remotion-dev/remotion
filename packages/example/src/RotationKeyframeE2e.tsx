import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';

export const RotationKeyframeE2e: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#111'}}>
			<Sequence
				name="Keyframed rotation"
				durationInFrames={90}
				style={{
					height: 400,
					rotate: interpolate(frame, [0, 30], ['0deg', '30deg']),
					width: 400,
				}}
			>
				<AbsoluteFill style={{backgroundColor: '#0b84ff'}} />
			</Sequence>
		</AbsoluteFill>
	);
};
