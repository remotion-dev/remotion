import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {annotationTextStyle, containerStyle} from './shared';

export const RoughNotationStrikeThrough: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>Forget </Interactive.Span>
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
					that
				</AnnotationOnTop>{' '}
				<Interactive.Span>draft</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
