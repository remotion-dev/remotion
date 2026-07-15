import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {CrossedOff} from '@remotion/rough-notation';
import React from 'react';
import {Interactive, interpolate, useCurrentFrame} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const CrossedOffText: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				fontSize: 80,
				fontWeight: 700,
				lineHeight: 1.1,
				color: '#171717',
				fontFamily,
			}}
		>
			<Interactive.Span>Please </Interactive.Span>
			<CrossedOff
				name="Crossed off annotation"
				progress={interpolate(frame, [18, 39], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				color="#eb2525"
				strokeWidth={6}
				iterations={10}
				roughness={2}
			>
				remove
			</CrossedOff>{' '}
			<Interactive.Span>this</Interactive.Span>
		</Interactive.Div>
	);
};
