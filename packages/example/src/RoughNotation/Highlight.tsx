import {AnnotationBehind} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {annotationTextStyle, containerStyle} from './shared';

export const RoughNotationHighlight: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>A truly </Interactive.Span>
				<AnnotationBehind
					name="Highlight annotation"
					progress={interpolate(frame, [0, 25], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					})}
					type="highlight"
					color={'rgba(255, 236, 79, 0.62)'}
					roughOptions={{maxRandomnessOffset: 10}}
					roughness={2.3}
					padding={{
						left: 20,
						right: 20,
						top: -30,
					}}
				>
					remarkable
				</AnnotationBehind>{' '}
				<Interactive.Span>end to the World cup</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
