import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Highlight} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const RoughNotationHighlightDemo: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
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
				<Interactive.Span>A truly </Interactive.Span>
				<Highlight
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
					color={'rgba(255, 236, 79, 0.62)'}
					maxRandomnessOffset={10}
					roughness={2.3}
					padding={{
						left: 20,
						right: 20,
					}}
					bowing={0}
				>
					remarkable
				</Highlight>{' '}
				<Interactive.Span>end to the World cup</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
