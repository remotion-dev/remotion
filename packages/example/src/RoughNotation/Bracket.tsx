import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {annotationTextStyle, containerStyle} from './shared';

export const RoughNotationBracket: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>Mark </Interactive.Span>
				<AnnotationOnTop
					name="Bracket annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="bracket"
					bracketLeft
					bracketRight
					bracketTop
					roughness={1}
					roughOptions={{bowing: 3}}
					strokeWidth={8}
					color="#dc2626"
				>
					this
				</AnnotationOnTop>{' '}
				<Interactive.Span>part</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
