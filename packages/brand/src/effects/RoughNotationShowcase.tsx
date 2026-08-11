import {gridlines} from '@remotion/effects/gridlines';
import {paper} from '@remotion/effects/paper';
import {vignette} from '@remotion/effects/vignette';
import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {
	Box,
	Bracket,
	Circle,
	CrossedOff,
	Highlight,
	StrikeThrough,
	Underline,
} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Series,
	Solid,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const WIDTH = 1080;
const HEIGHT = 1080;
const SLIDE_DURATION = 54;

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

const slides = [
	'highlight',
	'underline',
	'circle',
	'box',
	'crossed-off',
	'strike-through',
	'bracket',
] as const;

type Slide = (typeof slides)[number];

export const roughNotationShowcaseDurationInFrames =
	slides.length * SLIDE_DURATION;

const renderAnnotation = ({
	type,
	progress,
}: {
	readonly type: Slide;
	readonly progress: number;
}) => {
	if (type === 'highlight') {
		return (
			<Highlight
				progress={progress}
				color="rgba(255, 221, 64, 0.72)"
				roughness={2.3}
				maxRandomnessOffset={10}
				padding={{left: 18, right: 18}}
			>
				Highlight
			</Highlight>
		);
	}

	if (type === 'underline') {
		return (
			<Underline
				progress={progress}
				color="#ef5b3f"
				strokeWidth={12}
				roughness={1.8}
				padding={{top: -4}}
			>
				Underline
			</Underline>
		);
	}

	if (type === 'circle') {
		return (
			<Circle
				progress={progress}
				color="#2563eb"
				strokeWidth={12}
				roughness={1.8}
				padding={{left: 42, right: 51, top: 16, bottom: 26}}
				box="inside"
			>
				Circle
			</Circle>
		);
	}

	if (type === 'box') {
		return (
			<Box
				progress={progress}
				color="#14805e"
				strokeWidth={10}
				roughness={1.7}
				padding={{left: 18, right: 18, top: 4, bottom: 4}}
			>
				Box
			</Box>
		);
	}

	if (type === 'crossed-off') {
		return (
			<CrossedOff
				progress={progress}
				color="#df2f2f"
				strokeWidth={10}
				iterations={3}
				roughness={1.8}
			>
				Crossed Off
			</CrossedOff>
		);
	}

	if (type === 'strike-through') {
		return (
			<StrikeThrough
				progress={progress}
				color="#df2f2f"
				strokeWidth={12}
				iterations={2}
				roughness={1.8}
			>
				Strike Through
			</StrikeThrough>
		);
	}

	return (
		<Bracket
			progress={progress}
			color="#7c3aed"
			strokeWidth={11}
			roughness={1.7}
			bracketLeft
			bracketRight
			padding={{left: 20, right: 20, top: 8, bottom: 8}}
		>
			Bracket
		</Bracket>
	);
};

const AnnotationSlide: React.FC<{readonly type: Slide}> = ({type}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [8, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 1, 0.36, 1),
	});
	const opacity = interpolate(
		frame,
		[0, 6, SLIDE_DURATION - 7, SLIDE_DURATION - 1],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const scale = interpolate(frame, [0, 8], [0.97, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				opacity,
				transform: `scale(${scale})`,
			}}
		>
			<div
				style={{
					color: '#17130f',
					fontFamily,
					fontSize: 154,
					fontWeight: 700,
					lineHeight: 1.1,
					textAlign: 'center',
					whiteSpace: 'nowrap',
				}}
			>
				{renderAnnotation({type, progress})}
			</div>
		</AbsoluteFill>
	);
};

export const RoughNotationShowcase: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#f5f0e6'}}>
			<Solid
				width={WIDTH}
				height={HEIGHT}
				color="#f5f0e6"
				showInTimeline={false}
				effects={[
					paper({
						amount: 0.38,
						colorFront: 'white',
						colorBack: 'white',
						contrast: 0.18,
						roughness: 0.18,
						fiber: 0.28,
						crumples: 0.1,
						folds: 0.12,
						seed: 24,
						scale: 0.8,
					}),
					gridlines({
						gridSize: 54,
						lineWidth: 1.25,
						lineColor: 'rgba(76, 101, 128, 0.16)',
					}),
					vignette({
						amount: 0.3,
						radius: 0.72,
						feather: 0.38,
						color: '#2b2118',
					}),
				]}
			/>
			<Series>
				{slides.map((type) => (
					<Series.Sequence key={type} durationInFrames={SLIDE_DURATION}>
						<AnnotationSlide type={type} />
					</Series.Sequence>
				))}
			</Series>
		</AbsoluteFill>
	);
};
