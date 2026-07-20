import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Bracket} from '@remotion/rough-notation';
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

export const RoughNotationBracketDemo: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#fff',
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
				<Interactive.Span>Mark </Interactive.Span>
				<Bracket
					name="Bracket annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					bracketLeft
					bracketRight
					bracketTop
					roughness={1}
					bowing={3}
					strokeWidth={8}
					color="#dc2626"
					bracketBottom
					padding={{
						top: -11,
					}}
				>
					this
				</Bracket>{' '}
				<Interactive.Span>part</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
