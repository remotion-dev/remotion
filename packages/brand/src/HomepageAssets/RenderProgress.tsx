import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ThreeDElement} from './element';
import {Faces} from './Faces';
import {useFont} from './get-char';
import {rotateX, rotateY, translateY} from './matrix';
import {getButton} from './RenderProgress/make-button';

const viewBox = [-1600, -800, 3200, 1600];
const color = '#0b84f3';
const depth = 150;
const spacing = 900;
const initialY = 50 * 7.5;
export const renderProgressDurationInFrames = 268;
const rotationReferenceDurationInFrames = 1200;
const phrases = ['video.mp4', 'thumb.png', 'sound.wav', 'doc.pdf'] as const;
const cycleOffsets = [-1, 0, 1] as const;
const fadeInStartY = 1000;
const fadeInEndY = 650;
const fadeOutStartY = -650;
const fadeOutEndY = -1000;

const modulo = (value: number, by: number) => {
	return ((value % by) + by) % by;
};

const getCardOpacity = (y: number) => {
	const fadeIn = interpolate(y, [fadeInEndY, fadeInStartY], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fadeOut = interpolate(y, [fadeOutEndY, fadeOutStartY], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return Math.min(fadeIn, fadeOut);
};

export const RenderProgress: React.FC = () => {
	const currentFrame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const frame = modulo(currentFrame, durationInFrames);
	const loopProgress = frame / durationInFrames;
	const cycleHeight = phrases.length * spacing;
	const scroll = loopProgress * cycleHeight;
	const itemSpacingInFrames = durationInFrames / phrases.length;

	const commonTransformations = [
		rotateX(-Math.PI / 5),
		rotateY(-(20 / rotationReferenceDurationInFrames) * Math.PI * 2),
	];

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
					transformations: [translateY(y), ...commonTransformations],
					frame: localFrame,
					fps,
				}),
				opacity: getCardOpacity(y),
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
							opacity: item.opacity,
							overflow: 'visible',
							position: 'absolute',
						}}
					>
						<Faces elements={item.elements} />
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
				translate: '-420px 0px',
				scale: 0.68,
			}}
		>
			<RenderProgress></RenderProgress>
		</Sequence>
	);
};
