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

export const RoughNotationPosterizedProgressDemo: React.FC = () => {
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
					name="Posterized progress annotation"
					progress={interpolate(frame, [0, 43], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						posterize: 10,
					})}
					color={'#2563eb'}
					strokeWidth={10}
					roughness={1.8}
				>
					motion
				</Circle>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
