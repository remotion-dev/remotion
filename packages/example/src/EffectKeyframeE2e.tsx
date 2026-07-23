import {wave} from '@remotion/effects/wave';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

export const EffectKeyframeE2e: React.FC = () => {
	return (
		<AbsoluteFill>
			<Solid width={1080} height={1080} color="#1f2429" effects={[wave({})]} />
		</AbsoluteFill>
	);
};
