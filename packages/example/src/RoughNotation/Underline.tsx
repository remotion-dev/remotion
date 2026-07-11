import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {containerStyle} from './shared';

export const RoughNotationUnderline: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				name="Underline annotation"
				progress={interpolate(frame, [0, 60], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				type="underline"
				color="#355f8f"
				strokeWidth={10}
				iterations={3}
			>
				Underline this
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
