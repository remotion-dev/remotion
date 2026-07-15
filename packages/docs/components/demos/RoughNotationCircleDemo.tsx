import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Circle} from '@remotion/rough-notation';
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

export const RoughNotationCircleDemo: React.FC = () => {
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
				<Interactive.Span>How much </Interactive.Span>
				<Circle
					name="Circle annotation"
					progress={interpolate(frame, [0, 43], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [Easing.bezier(0.42, 0, 0.58, 1)],
					})}
					roughness={0.6}
					strokeWidth={12}
					color={'rgba(37, 99, 235, 0.57)'}
					padding={{
						left: 10,
						right: 10,
						top: 10,
						bottom: 10,
					}}
					box={'inside'}
				>
					circular
				</Circle>{' '}
				<Interactive.Span>financing is in AI?</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
