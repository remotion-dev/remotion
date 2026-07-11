import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
	Easing,
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
					progress={interpolate(frame, [0, 24], [0, 1], {
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
					type="circle"
					box="around"
					roughness={1.1}
					bowing={3}
					strokeWidth={9}
					color={'rgba(37, 99, 235, 0.57)'}
					iterations={1}
					padding={{
						top: -16,
					}}
				>
					point
				</AnnotationOnTop>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
