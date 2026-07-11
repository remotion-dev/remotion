import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {containerStyle, fontFamily} from './shared';

export const RoughNotationCircle: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div
				style={{
					fontSize: 80,
					fontWeight: 700,
					lineHeight: 1.1,
					color: '#171717',
					fontFamily,
					width: 800,
				}}
			>
				<Interactive.Span>How much </Interactive.Span>
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
					circular
				</AnnotationOnTop>{' '}
				<Interactive.Span>financing is in AI?</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
