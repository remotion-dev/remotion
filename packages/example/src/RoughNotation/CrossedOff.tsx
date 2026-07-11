import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {containerStyle} from './shared';

export const RoughNotationCrossedOff: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				name="Crossed off annotation"
				progress={interpolate(frame, [0, 60], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				type="crossed-off"
				color="#2563eb"
				strokeWidth={14}
			>
				Remove
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
