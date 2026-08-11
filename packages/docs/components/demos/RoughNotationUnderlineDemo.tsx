import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Underline} from '@remotion/rough-notation';
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

export const RoughNotationUnderlineDemo: React.FC = () => {
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
				<Interactive.Span>Underline </Interactive.Span>
				<Underline
					name="Underline annotation"
					progress={interpolate(frame, [14, 35], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					color={'rgba(53, 95, 143, 0.71)'}
					strokeWidth={10}
					iterations={3}
				>
					this
				</Underline>{' '}
				<Interactive.Span>phrase</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
