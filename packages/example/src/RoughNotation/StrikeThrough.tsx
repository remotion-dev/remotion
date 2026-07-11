import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {containerStyle} from './shared';

export const RoughNotationStrikeThrough: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				name="Strike-through annotation"
				progress={interpolate(frame, [0, 60], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				type="strike-through"
				color="#111827"
				strokeWidth={14}
			>
				Forget that
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
