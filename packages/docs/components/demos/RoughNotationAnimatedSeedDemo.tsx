import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Circle} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const RoughNotationAnimatedSeedDemo: React.FC = () => {
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
					textAlign: 'center',
				}}
			>
				<Circle
					name="Animated seed annotation"
					progress={1}
					color={'#2563eb'}
					strokeWidth={10}
					roughness={1.8}
					seed={interpolate(frame, [0, 89], [1, 90], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
				>
					motion
				</Circle>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
