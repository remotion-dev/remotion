import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Faces} from './Faces';
import {useFont} from './get-char';
import {rotateX, rotateY, rotateZ, translateY} from './matrix';
import {getButton} from './RenderProgress/make-button';

const viewBox = [-1600, -800, 3200, 1600];
const color = '#0b84f3';
const depth = 150;

export const RenderProgress: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const commonTransformations = [
		translateY((-frame * 1.8 + 50) * 7.5),
		rotateX(-Math.PI / 5),
		rotateZ(-Math.PI / 5),
		rotateZ(frame / 1400),
		rotateY(-frame / 600),
	];
	const font = useFont();
	if (!font) {
		return null;
	}

	const rendered = new Array(5).fill(true).map((_, i) => {
		return getButton({
			font,
			phrase: ['video.mp4', 'thumb.png', 'sound.wav', 'doc.pdf', 'anim.gif'][i],
			depth,
			color,
			delay: i * 40,
			transformations: [translateY(i * 900), ...commonTransformations],
			frame,
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
