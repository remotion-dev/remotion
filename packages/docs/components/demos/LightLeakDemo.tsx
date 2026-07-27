import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

interface Props {
	readonly seed: number;
	readonly hueShift: number;
}

export const LightLeakDemoComp: React.FC<Props> = ({seed, hueShift}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Solid
				width={width}
				height={height}
				effects={[
					lightLeak({
						seed,
						hueShift,
						progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
