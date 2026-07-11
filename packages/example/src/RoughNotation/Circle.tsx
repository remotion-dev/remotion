import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {containerStyle} from './shared';

export const RoughNotationCircle: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<div>
				Straight to the{' '}
				<AnnotationOnTop
					name="Circle annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="circle"
					box="around"
					roughOptions={{roughness: 3, bowing: 3}}
					strokeWidth={7}
					color="#2563eb"
				>
					point
				</AnnotationOnTop>
			</div>
		</AbsoluteFill>
	);
};
