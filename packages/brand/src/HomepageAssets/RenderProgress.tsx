import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Faces} from './Faces';
import {useFont} from './get-char';
import {getButton} from './RenderProgress/make-button';

const viewBox = [-1600, -800, 3200, 1600];
const color = '#0b84f3';
const depth = 150;
const spacing = 650;
const initialY = spacing;
export const renderProgressDurationInFrames = 268;
const phrases = ['video.mp4', 'thumb.png', 'sound.wav', 'funny.gif'] as const;
const cycleOffsets = [-1, 0, 1] as const;
const stepTransitionDurationInFrames = 24;
const easing = Easing.inOut(Easing.cubic);

const modulo = (value: number, by: number) => {
	return ((value % by) + by) % by;
};

const getCardScale = (localFrame: number, itemSpacingInFrames: number) => {
	const scaleIn = interpolate(
		localFrame,
		[
			-itemSpacingInFrames,
			-itemSpacingInFrames + stepTransitionDurationInFrames,
		],
		[0, 1],
		{
			easing,
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const scaleOut = interpolate(
		localFrame,
		[
			itemSpacingInFrames * 2,
			itemSpacingInFrames * 2 + stepTransitionDurationInFrames,
		],
		[1, 0],
		{
			easing,
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	return Math.min(scaleIn, scaleOut);
};

export const RenderProgress: React.FC = () => {
	const currentFrame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const frame = modulo(currentFrame, durationInFrames);
	const cycleHeight = phrases.length * spacing;
	const itemSpacingInFrames = durationInFrames / phrases.length;
	const step = Math.floor(frame / itemSpacingInFrames);
	const stepFrame = frame - step * itemSpacingInFrames;
	const scroll =
		spacing *
		(step +
			interpolate(stepFrame, [0, stepTransitionDurationInFrames], [0, 1], {
				easing,
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}));

	const font = useFont();
	if (!font) {
		return null;
	}

	const rendered = cycleOffsets.flatMap((cycleOffset) => {
		return phrases.map((phrase, i) => {
			const itemIndex = i + cycleOffset * phrases.length;
			const y = initialY + i * spacing - scroll + cycleOffset * cycleHeight;
			const localFrame = frame - itemIndex * itemSpacingInFrames;

			return {
				elements: getButton({
					font,
					phrase,
					depth,
					color,
					delay: 0,
					transformations: [],
					frame: localFrame,
					fps,
				}),
				y,
				scale: getCardScale(localFrame, itemSpacingInFrames),
			};
		});
	});

	return (
		<AbsoluteFill>
			{rendered.map((item, i) => {
				return (
					<svg
						key={i}
						viewBox={viewBox.join(' ')}
						style={{
							inset: 0,
							overflow: 'visible',
							position: 'absolute',
						}}
					>
						{/* The card is 2250 units wide; scale around its left edge. */}
						<g
							transform={`translate(-1125 ${item.y}) scale(${item.scale}) translate(1125 0)`}
						>
							<Faces elements={item.elements} />
						</g>
					</svg>
				);
			})}
		</AbsoluteFill>
	);
};

export const OuterRenderProgress = () => {
	return (
		<Sequence
			width={1920}
			height={1080}
			style={{
				translate: '-501px 50px',
				scale: 0.68,
			}}
		>
			<RenderProgress></RenderProgress>
		</Sequence>
	);
};
