import {blur} from '@remotion/effects/blur';
import {brightness} from '@remotion/effects/brightness';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Solid,
	useCurrentFrame,
} from 'remotion';
import {label} from './label';

export const EffectCopySource: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#111827'}}>
			<Solid
				width={1080}
				height={1080}
				color="#60a5fa"
				effects={[
					brightness({
						amount: interpolate(frame, [0, 100], [-0.25, 0.65], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.linear,
						}),
					}),
					blur({radius: 10}),
				]}
			/>
			<div style={label}>Copy this keyframed effects group</div>
		</AbsoluteFill>
	);
};
