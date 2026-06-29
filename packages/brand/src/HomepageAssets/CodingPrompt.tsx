import {parsePath, translatePath} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
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

const width = 1080;
const height = 600;
const depth = 95;
const prompt = 'Fly from LA to NY';
const thinking = 'Thinking';
const shineLoopInFrames = 60;

export const CodingPrompt: React.FC = () => {
	const frame = useCurrentFrame();
	const font = useFont('homepage-assets/gt-planar-medium.otf');

	if (!font) {
		return null;
	}

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

	const promptText = getText({font, text: prompt, size: 74});
	const promptTextFace = makeFace({
		fill: '#332f2a',
		points: translatePath(promptText.path, -475, -195),
		strokeWidth: 0,
		description: 'coding prompt text',
		strokeColor: '#332f2a',
		crispEdges: false,
	});

	const thinkingText = getText({font, text: thinking, size: 50});
	const thinkingPath = translatePath(thinkingText.path, -475, -124);
	const thinkingFace = makeFace({
		fill: '#8c8880',
		points: thinkingPath,
		strokeWidth: 0,
		description: 'coding prompt thinking text',
		strokeColor: '#8c8880',
		crispEdges: false,
	});
	const thinkingShineFace = makeFace({
		fill: 'url(#coding-prompt-thinking-shine)',
		points: thinkingPath,
		strokeWidth: 0,
		description: 'coding prompt thinking shine',
		strokeColor: 'transparent',
		crispEdges: false,
	});
	const shineProgress = (frame % shineLoopInFrames) / shineLoopInFrames;
	const shineCenter = shineProgress * 1.8 - 0.4;

	const transformations = [
		rotateX(-0.35),
		rotateY(-0.3),
		rotateZ(-0.06),
		scaled(1.15),
		translateX(20),
		translateY(5),
	];

	const promptContent = transformElement(
		makeElement([promptTextFace, thinkingFace], [0, 0, 0, 1], 'prompt content'),
		[translateZ(-depth / 2 - 0.001)],
	);
	const thinkingShine = transformElement(
		makeElement(thinkingShineFace, [0, 0, 0, 1], 'thinking shine'),
		[translateZ(-depth / 2 - 0.002)],
	);
	const elements = transformElements(
		[plane, promptContent, thinkingShine],
		transformations,
	);
	const viewBox = [-960, -540, 1920, 1080];

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg viewBox={viewBox.join(' ')} style={{overflow: 'visible'}}>
				<defs>
					<linearGradient
						id="coding-prompt-thinking-shine"
						x1={shineCenter - 0.5}
						x2={shineCenter + 0.5}
						y1="0"
						y2="0"
					>
						<stop offset="0%" stopColor="white" stopOpacity={0} />
						<stop offset="42%" stopColor="white" stopOpacity={0} />
						<stop offset="50%" stopColor="white" stopOpacity={0.72} />
						<stop offset="58%" stopColor="white" stopOpacity={0} />
						<stop offset="100%" stopColor="white" stopOpacity={0} />
					</linearGradient>
				</defs>
				<Faces elements={elements} />
			</svg>
		</AbsoluteFill>
	);
};
