import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {annotationTextStyle, containerStyle} from './shared';

export const RoughNotationCircle: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>Straight to the </Interactive.Span>
				<AnnotationOnTop
					name="Circle annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="circle"
					box="around"
					roughness={3}
					roughOptions={{bowing: 3}}
					strokeWidth={7}
					color="#2563eb"
				>
					point
				</AnnotationOnTop>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
