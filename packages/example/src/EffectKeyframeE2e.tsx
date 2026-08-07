import {wave} from '@remotion/effects/wave';
import React from 'react';
import {AbsoluteFill, interpolate, Solid, useCurrentFrame} from 'remotion';

export const EffectKeyframeE2e: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Solid
				name="Scale precision"
				width={1080}
				height={1080}
				color="#1f2429"
				style={{scale: 1}}
				effects={[wave({})]}
			/>
			<Solid
				name="Timeline expansion"
				width={540}
				height={540}
				color="#1f2429"
				style={{opacity: interpolate(frame, [0, 30], [0, 1])}}
			/>
		</AbsoluteFill>
	);
};
