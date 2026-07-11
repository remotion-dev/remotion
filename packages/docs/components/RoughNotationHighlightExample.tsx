import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {Player} from '@remotion/player';
import {AnnotationBehind} from '@remotion/rough-notation';
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

const containerStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
};

const annotationTextStyle: React.CSSProperties = {
	fontSize: 80,
	fontWeight: 700,
	lineHeight: 1.1,
	color: '#171717',
	fontFamily,
	width: 800,
};

const RoughNotationHighlightComposition: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>A truly </Interactive.Span>
				<AnnotationBehind
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
					type="highlight"
					color="rgba(255, 236, 79, 0.62)"
					roughOptions={{maxRandomnessOffset: 10}}
					roughness={2.3}
					padding={{
						left: 20,
						right: 20,
						top: -30,
					}}
				>
					remarkable
				</AnnotationBehind>{' '}
				<Interactive.Span>end to the World cup</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const RoughNotationHighlightExample: React.FC = () => {
	return (
		<Player
			acknowledgeRemotionLicense
			component={RoughNotationHighlightComposition}
			compositionWidth={1080}
			compositionHeight={500}
			durationInFrames={90}
			fps={30}
			autoPlay
			loop
			style={{
				width: '100%',
				border: '1px solid var(--ifm-color-emphasis-300)',
				borderRadius: 'var(--ifm-pre-border-radius)',
				backgroundColor: 'white',
			}}
		/>
	);
};
