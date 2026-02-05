import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const LightLeakAnimatedSize: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();

	const scale = interpolate(
		frame,
		[0, durationInFrames / 2, durationInFrames - 1],
		[0.3, 1, 0.5],
	);

	const w = Math.round(width * scale);
	const h = Math.round(height * scale);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<LightLeak
				durationInFrames={durationInFrames}
				seed={3}
				hueShift={30}
				width={w}
				height={h}
			/>
		</AbsoluteFill>
	);
};
