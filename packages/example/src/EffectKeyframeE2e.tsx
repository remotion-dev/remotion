import {wave} from '@remotion/effects/wave';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

export const EffectKeyframeE2e: React.FC = () => {
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
		</AbsoluteFill>
	);
};
