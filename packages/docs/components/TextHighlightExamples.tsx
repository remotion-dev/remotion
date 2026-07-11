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

const playerStyle: React.CSSProperties = {
	width: '100%',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 'var(--ifm-pre-border-radius)',
	backgroundColor: 'white',
};

const layout: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: 'white',
};

const RoughHighlightComposition: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={layout}>
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
				<Interactive.Span>The turning point was </Interactive.Span>
				<AnnotationBehind
					name="Rough highlight"
					progress={interpolate(frame, [0, 28], [0, 1], {
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
					roughness={2.3}
					maxRandomnessOffset={10}
					padding={{
						left: 20,
						right: 20,
						top: -30,
					}}
				>
					obvious
				</AnnotationBehind>
				<Interactive.Span>.</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const TextHighlightRoughNotationDemo: React.FC = () => {
	return (
		<Player
			acknowledgeRemotionLicense
			component={RoughHighlightComposition}
			compositionWidth={1080}
			compositionHeight={500}
			durationInFrames={90}
			fps={30}
			autoPlay
			loop
			style={playerStyle}
		/>
	);
};
