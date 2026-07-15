import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Circle} from '@remotion/rough-notation';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const CircleMarker: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
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
					posterize: 10,
				})}
				seed={interpolate(frame, [0, 89], [1, 90], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					posterize: 10,
				})}
				roughness={1.8}
				strokeWidth={12}
				color="#2563eb"
				padding={{
					left: 10,
					right: 10,
					top: 10,
					bottom: 10,
				}}
				box="inside"
			>
				circular
			</Circle>{' '}
			<Interactive.Span>financing is in AI?</Interactive.Span>
		</Interactive.Div>
	);
};
