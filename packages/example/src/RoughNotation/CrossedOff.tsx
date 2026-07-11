import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {annotationTextStyle, containerStyle} from './shared';

export const RoughNotationCrossedOff: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>Please </Interactive.Span>
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
					remove
				</AnnotationOnTop>{' '}
				<Interactive.Span>this</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
