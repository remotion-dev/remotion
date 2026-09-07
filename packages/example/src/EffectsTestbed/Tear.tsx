import {scale} from '@remotion/effects/scale';
import {tear} from '@remotion/effects/tear';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const background: React.CSSProperties = {
	backgroundColor: '#101827',
};

export const TearEffectTest: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const progress = interpolate(frame, [15, 105], [0, 1], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={background}>
			<CanvasImage
				src={staticFile('1.jpg')}
				width={width}
				height={height}
				fit="cover"
				effects={[
					scale({scale: 1.12}),
					tear({
						progress,
						gap: 420,
						jaggedness: 149,
						frequency: 6,
						seed: 3,
						center: 0.5,
						rotation: 7,
						direction: 'top-to-bottom',
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
