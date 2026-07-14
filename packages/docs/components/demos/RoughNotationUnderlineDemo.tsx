import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {AnnotationOnTop} from '@remotion/rough-notation';
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
				<AnnotationOnTop
					name="Underline annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="underline"
					color="#355f8f"
					strokeWidth={10}
					iterations={3}
				>
					this
				</AnnotationOnTop>{' '}
				<Interactive.Span>phrase</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
