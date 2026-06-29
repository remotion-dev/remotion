import {parsePath, translatePath} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {centerPath} from './center';
import {makeElement, transformElement} from './element';
import {Faces} from './Faces';
import {getText, useFont} from './get-char';
import {extrudeElement} from './join-inbetween-tiles';
import {makeFace, transformElements} from './map-face';
import {
	rotateX,
	rotateY,
	rotateZ,
	scaled,
	translateX,
	translateY,
	translateZ,
} from './matrix';

const width = 1700;
const height = 720;
const depth = 120;
const prompt = 'Fly from LA to NY';

export const CodingPrompt: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const font = useFont();

	if (!font) {
		return null;
	}

	const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	const rect = makeRect({
		width,
		height,
		cornerRadius: 42,
	});

	const plane = extrudeElement({
		backFaceColor: '#141414',
		sideColor: '#050505',
		frontFaceColor: '#f6f4ee',
		depth,
		points: parsePath(centerPath(rect.path)),
		strokeWidth: 18,
		description: 'coding prompt plane',
		strokeColor: '#050505',
		crispEdges: false,
	});

	const promptText = getText({font, text: prompt, size: 54});
	const promptTextFace = makeFace({
		fill: '#332f2a',
		points: translatePath(promptText.path, -700, -202),
		strokeWidth: 0,
		description: 'coding prompt text',
		strokeColor: '#332f2a',
		crispEdges: false,
	});

	const cursorFace = makeFace({
		fill: '#0b84f3',
		points: translatePath(
			makeRect({
				width: 10,
				height: 86,
				cornerRadius: 5,
			}).path,
			-738,
			-262,
		),
		strokeWidth: 0,
		description: 'coding prompt cursor',
		strokeColor: '#0b84f3',
		crispEdges: false,
	});

	const transformations = [
		rotateX(interpolate(progress, [0, 1], [-0.42, -0.34])),
		rotateY(interpolate(progress, [0, 1], [-0.62, -0.18])),
		rotateZ(-0.075),
		scaled(1.25),
		translateX(120),
		translateY(20),
	];

	const content = transformElement(
		makeElement([promptTextFace, cursorFace], [0, 0, 0, 1], 'prompt content'),
		[translateZ(-depth / 2 - 0.001)],
	);
	const elements = transformElements([plane, content], transformations);
	const viewBox = [-960, -540, 1920, 1080];

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: 'white'}} />
			<svg viewBox={viewBox.join(' ')} style={{overflow: 'visible'}}>
				<Faces elements={elements} />
			</svg>
		</AbsoluteFill>
	);
};
