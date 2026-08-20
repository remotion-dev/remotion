import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';

export const AffineFrameClock: React.FC = () => {
	const frame = useCurrentFrame();
	const captureFrame = frame + 30;

	return (
		<AbsoluteFill style={{backgroundColor: '#111'}} from={-30}>
			<Sequence
				name="Affine frame clock"
				durationInFrames={60}
				style={{
					height: 400,
					rotate: interpolate(captureFrame, [30, 60], ['0deg', '30deg']),
					width: 400,
				}}
			>
				<AbsoluteFill style={{backgroundColor: '#0b84ff'}} />
			</Sequence>
		</AbsoluteFill>
	);
};
