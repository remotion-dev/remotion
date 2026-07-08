import {centerPath, parsePath} from '@remotion/paths';
import {makeCircle, makeRect} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BLUE} from '../colors';
import {makeElement, transformElement} from '../element';
import {Faces} from '../Faces';
import {getChars, getText, useFont} from '../get-char';
import {extrudeElement} from '../join-inbetween-tiles';
import {makeFace, transformElements} from '../map-face';
import {
	MatrixTransform4D,
	rotateX,
	rotateY,
	rotateZ,
	scaled,
	translateX,
	translateY,
	translateZ,
} from '../matrix';
import {truthy} from '../truthy';

const depth = 20 * 7.5;
const dotRadius = 3 * 7.5;

const rectWidth = 150 * 7.5;
const rectHeight = 120 * 7.5;

const curl = (i: number, progress: number): MatrixTransform4D[] => {
	const distance = interpolate(progress, [0, 1], [1, 0.000000005]);
	const divide = 1 / distance;

	const index = (i + 10) / (divide * 80);

	const z = Number(Math.cos(index * -Math.PI * 2));
	const y = Number(Math.sin(index * Math.PI * 2));
	const r = interpolate(index, [0, 1], [0, Math.PI * 2]) / 2;

	return [
		translateZ(-interpolate(progress, [0, 1], [200, 0])),
		translateZ(z),
		translateY(y),
		rotateY(r),
	];
};

export const NpmIniVideo: React.FC = () => {
	const {width, height, fps} = useVideoConfig();
	const viewBox = [-width / 2, -height / 2, width, height];
	const frame = useCurrentFrame() + 20;

	const font = useFont();

	if (!font) {
		return null;
	}

	const dollar = getText({
		font,
		text: '$',
		size: 75,
	});

	const npmInitVideo = getChars({
		font,
		text: 'npm init video',
		size: 75,
	});

	const rect = makeRect({
		width: rectWidth,
		height: rectHeight,
		cornerRadius: 6 * 7.5,
	});

	const dot = makeCircle({
		radius: dotRadius,
	});

	const topLeftTransformation: MatrixTransform4D[] = [
		translateY(dotRadius / 2),
		translateX(-rectWidth / 2),
		translateY(-rectHeight / 2),
		translateY(-dotRadius / 2),
		translateX(7 * 7.5),
		translateY(7 * 7.5),
		translateZ(-depth / 2),
	];

	const transformations = [
		rotateX(-0.5 - frame / 900),
		rotateY(-Math.PI / 3 + frame / 400),
		rotateZ(-0.2853981634),
		scaled(1.8 - frame / 300),
		translateX(600 - frame * 2),
		translateY(300 - frame),
	];

	const redFace = makeFace({
		fill: '#fe5f57',
		points: dot.path,
		strokeWidth: 0,
		strokeColor: 'black',
		description: 'redFace',
		crispEdges: false,
	});

	const textProgress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 300,
	});

	const redElement = transformElement(
		makeElement(redFace, redFace.centerPoint, 'redFace'),
		[...topLeftTransformation, ...transformations],
	);

	const yellowFace = makeFace({
		fill: '#ffbc2e',
		points: dot.path,
		strokeWidth: 0,
		strokeColor: 'black',
		description: 'yellowFace',
		crispEdges: false,
	});

	const yellowElement = transformElement(
		makeElement(yellowFace, [0, 0, 0, 1], 'yellowFace'),
		[...topLeftTransformation, translateX(10 * 7.5), ...transformations],
	);

	const greenFace = makeFace({
		fill: '#28c840',
		points: dot.path,
		strokeWidth: 0,
		strokeColor: 'black',
		description: 'greenFace',
		crispEdges: false,
	});

	const greenElement = transformElement(
		makeElement(greenFace, greenFace.centerPoint, 'greenFace'),
		[...topLeftTransformation, translateX(20 * 7.5), ...transformations],
	);

	const dollarFace = makeFace({
		fill: BLUE,
		points: dollar.path,
		strokeWidth: 0,
		strokeColor: 'black',
		description: 'dollarFace',
		crispEdges: false,
	});

	const dollarElement = transformElement(
		makeElement(dollarFace, dollarFace.centerPoint, 'dollarFace'),
		[...topLeftTransformation, translateY(25 * 7.5), ...transformations],
	);

	const allTextFaces = npmInitVideo.path
		.map((points, i) => {
			if (points === '') {
				return null;
			}

			const npmFace = makeFace({
				fill: 'white',
				points,
				strokeWidth: 2,
				strokeColor: 'black',
				description: 'npmInitVideoFace',
				crispEdges: false,
			});

			return transformElement(
				makeElement(npmFace, npmFace.centerPoint, 'npmInitVideoFace'),
				[
					...curl(i, textProgress),
					...topLeftTransformation,
					translateY(25 * 7.5),
					translateX(10 * 7.5),
					...transformations,
				],
			);
		})
		.filter(truthy);

	const centered = centerPath(rect.path);
	const extrude = extrudeElement({
		backFaceColor: 'black',
		depth,
		frontFaceColor: '#222',
		points: parsePath(centered),
		sideColor: 'black',
		strokeWidth: 10,
		description: 'npm init video',
		strokeColor: 'black',
		crispEdges: false,
	});

	const allFaces = [
		transformElement(extrude, transformations),
		redElement,
		yellowElement,
		greenElement,
		dollarElement,
		...allTextFaces,
	];

	const all = transformElements(allFaces, []);

	return (
		<AbsoluteFill>
			<svg viewBox={viewBox.join(' ')}>
				<Faces noSort elements={all} />
			</svg>
		</AbsoluteFill>
	);
};
