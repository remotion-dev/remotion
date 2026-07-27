import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {AbsoluteFill, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

interface Props {
	readonly seed: number;
	readonly hueShift: number;
}

export const LightLeakDemoComp: React.FC<Props> = ({seed, hueShift}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();
	const progress = durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Solid
				width={width}
				height={height}
				effects={[lightLeak({seed, hueShift, progress})]}
			/>
		</AbsoluteFill>
	);
};
