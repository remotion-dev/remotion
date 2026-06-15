import {blur} from '@remotion/effects/blur';
import {brightness} from '@remotion/effects/brightness';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Solid,
	useCurrentFrame,
	interpolateColors,
} from 'remotion';
import {label} from './label';

export const EffectCopySource: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#111827'}}>
			<Solid
				width={1198}
				height={1080}
				color={interpolateColors(frame, [42, 75], ['#586678', '#586678'])}
				effects={[
					brightness({
						amount: 0.65,
					}),
					blur({radius: 10}),
				]}
				style={{
					transformOrigin: interpolate(
						frame,
						[18, 72],
						['50% 50%', '50% 50%'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.6384, 3, 0.3189, 0.623)],
						},
					),
				}}
			/>
			<div style={label}>Copy this keyframed effects group</div>
		</AbsoluteFill>
	);
};
