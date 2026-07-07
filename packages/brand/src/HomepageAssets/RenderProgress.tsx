import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
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

const modulo = (value: number, by: number) => {
	return ((value % by) + by) % by;
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

			return getButton({
				font,
				phrase,
				depth,
				color,
				delay: 0,
				transformations: [translateY(y), ...commonTransformations],
				frame: localFrame,
				fps,
			});
		});
	});

	return (
		<AbsoluteFill>
			<svg viewBox={viewBox.join(' ')} style={{overflow: 'visible'}}>
				<Faces elements={rendered.flat(1)} />
			</svg>
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
