import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
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
const phrases = [
	'video.mp4',
	'thumb.png',
	'sound.wav',
	'doc.pdf',
] as const;

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
	const getWrappedY = (index: number) => {
		return (
			modulo(
				initialY + index * spacing - scroll + cycleHeight / 2,
				cycleHeight,
			) -
			cycleHeight / 2
		);
	};

	const getLocalFrame = (index: number, wrappedY: number) => {
		const rawY = initialY + index * spacing - scroll;
		const wrapCount = Math.round((wrappedY - rawY) / cycleHeight);
		const itemIndex = index + wrapCount * phrases.length;

		return frame - itemIndex * itemSpacingInFrames;
	};

	const font = useFont();
	if (!font) {
		return null;
	}

	const rendered = phrases.map((phrase, i) => {
		const wrappedY = getWrappedY(i);
		const localFrame = getLocalFrame(i, wrappedY);

		return getButton({
			font,
			phrase,
			depth,
			color,
			delay: 0,
			transformations: [translateY(wrappedY), ...commonTransformations],
			frame: localFrame,
			fps,
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
