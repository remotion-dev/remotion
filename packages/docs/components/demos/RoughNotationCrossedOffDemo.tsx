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

export const RoughNotationCrossedOffDemo: React.FC = () => {
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
				<Interactive.Span>Please </Interactive.Span>
				<AnnotationOnTop
					name="Crossed off annotation"
					progress={interpolate(frame, [0, 21], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="crossed-off"
					color={'#eb2525'}
					strokeWidth={6}
					iterations={10}
					roughness={2}
				>
					remove
				</AnnotationOnTop>{' '}
				<Interactive.Span>this</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
