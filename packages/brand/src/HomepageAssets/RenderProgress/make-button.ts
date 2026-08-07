import {
	centerPath,
	getBoundingBox,
	parsePath,
	resetPath,
	scalePath,
	translatePath,
} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {Font} from 'opentype.js';
import {interpolate, spring} from 'remotion';
import {makeElement, ThreeDElement, transformElement} from '../element';
import {turnInto3D} from '../fix-z';
import {getText} from '../get-char';
import {extrudeElement} from '../join-inbetween-tiles';
import {transformElements} from '../map-face';
import {MatrixTransform4D, rotateX, translateZ, Vector4D} from '../matrix';
import {makeRoundedProgress} from './make-rounded-progress';

const outerCornerRadius = 30 * 7.5;
const padding = 8 * 7.5;
const outerWidth = 300 * 7.5;
const outerHeight = 100 * 7.5;
const progressDurationInFrames = 34;
const progressStartOffsetInFrames = 24;
const flipDelayInFrames = 10;

const videoFileIconPath =
	'M96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32L96 96zM32 128c0-35.3 28.7-64 64-64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L96 448c-35.3 0-64-28.7-64-64l0-256zm432 84l0-40 73.6-55.2c4.2-3.1 9.2-4.8 14.4-4.8 13.3 0 24 10.7 24 24l0 240c0 13.3-10.7 24-24 24-5.2 0-10.2-1.7-14.4-4.8l-73.6-55.2 0-40 80 60 0-208-80 60z';
const imageFileIconPath =
	'M324.9 157.8c-11.38-17.38-39.89-17.31-51.23-.063L200.5 268.5l-16.4-22.6c-11.4-16.8-38.2-16-49.7 0l-64.52 89.16c-6.797 9.406-7.75 21.72-2.547 32C72.53 377.5 83.05 384 94.75 384h322.5c11.41 0 21.8-6.281 27.14-16.38a30.922 30.922 0 0 0-1.516-31.56L324.9 157.8zM95.8 352l62.39-87.38 29.91 41.34c3.1 4.24 8.3 7.24 13.3 6.64 5.25-.125 10.12-2.781 13.02-7.188l83.83-129.9L415 352H95.8zM447.1 32h-384C28.65 32-.01 60.65-.01 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96c.01-35.35-27.79-64-63.99-64zM480 416c0 17.64-14.36 32-32 32H64c-17.64 0-32-14.36-32-32V96c0-17.64 14.36-32 32-32h384c17.64 0 32 14.36 32 32v320zM144 192c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm0-64c8.822 0 15.1 7.178 15.1 16s-6.3 16-15.1 16-16-7.2-16-16 7.2-16 16-16z';
const audioFileIconPath =
	'M480 16l0-19.9-19.5 4.3-288 64-12.5 2.8 0 273.2c-17-12.7-39.4-20.4-64-20.4-53 0-96 35.8-96 80s43 80 96 80 96-35.8 96-80l0-187.2 256-56.9 0 120.4c-17-12.7-39.4-20.4-64-20.4-53 0-96 35.8-96 80s43 80 96 80 96-35.8 96-80l0-320zM448 336c0 26.5-28.7 48-64 48s-64-21.5-64-48 28.7-48 64-48 64 21.5 64 48zM160 400c0 26.5-28.7 48-64 48s-64-21.5-64-48 28.7-48 64-48 64 21.5 64 48zM448 123.2l-256 56.9 0-87.2 256-56.9 0 87.2z';
const genericFileIconPath =
	'M0 64C0 28.65 28.65 0 64 0h156.1c12.7 0 25 5.057 34 14.06L369.9 129.9c9 9 14.1 21.3 14.1 34V448c0 35.3-28.7 64-64 64H64c-35.35 0-64-28.7-64-64V64zm352 128H240c-26.5 0-48-21.5-48-48V32H64c-17.67 0-32 14.33-32 32v384c0 17.7 14.33 32 32 32h256c17.7 0 32-14.3 32-32V192zm-4.7-39.4L231.4 36.69c-2-2.07-4.6-3.51-7.4-4.21V144c0 8.8 7.2 16 16 16h111.5c-.7-2.8-2.1-5.4-4.2-7.4z';

export const getButton = ({
	font,
	phrase,
	depth,
	color,
	delay,
	transformations,
	frame,
	fps,
}: {
	font: Font;
	phrase: string;
	depth: number;
	color: string;
	delay: number;
	transformations: MatrixTransform4D[];
	frame: number;
	fps: number;
}): ThreeDElement[] => {
	const shiftAnimationsEarlierByFrames = fps;
	const rect = makeRect({
		height: outerHeight,
		width: outerWidth,
		cornerRadius: outerCornerRadius,
	});

	const turn = spring({
		fps,
		frame: frame + shiftAnimationsEarlierByFrames,
		config: {
			damping: 200,
		},
		delay: flipDelayInFrames + delay,
	});

	const evolve = spring({
		fps,
		frame: frame + progressStartOffsetInFrames + shiftAnimationsEarlierByFrames,
		config: {
			damping: 200,
		},
		durationInFrames: progressDurationInFrames,
		delay,
	});

	const boxWidth = outerWidth - padding * 2;
	const boxHeight = outerHeight - padding * 2;

	const text = getText({font, text: phrase, size: 80});

	const path = resetPath(rect.path);

	const boundingBox = getBoundingBox(path);
	const width = boundingBox.x2 - boundingBox.x1;
	const height = boundingBox.y2 - boundingBox.y1;

	const rotation = interpolate(turn, [0, 1], [0, Math.PI]);

	const extruded = extrudeElement({
		backFaceColor: 'white',
		sideColor: 'black',
		frontFaceColor: 'white',
		depth,
		points: parsePath(centerPath(rect.path)),
		strokeWidth: 30,
		description: 'Button',
		strokeColor: 'black',
		crispEdges: true,
	});

	const progressFace = transformElement(
		makeElement(
			{
				points: makeRoundedProgress({
					outerCornerRadius,
					boxHeight,
					evolve,
					height,
					width,
					padding,
					boxWidth,
				}),
				color,
				centerPoint: [0, 0, 0, 1] as Vector4D,
				strokeWidth: 30,
				strokeColor: 'black',
				description: 'progress',
				crispEdges: true,
			},
			[0, 0, 0, 1],
			'progress',
		),
		[translateZ(-depth / 2 - 0.0001)],
	);

	const scaled = resetPath(scalePath(text.path, 0.4 * 7.5, 0.4 * 7.5));
	const boundingBoxText = getBoundingBox(scaled);
	const leftAlignedText = translatePath(
		scaled,
		-boxWidth / 2 + 20 * 7.5,
		-boundingBoxText.y2 / 2,
	);

	const faceTransformations = [
		rotateX(Math.PI),
		translateZ(depth / 2 + 0.0001),
	];

	const textFace = transformElement(
		makeElement(
			{
				points: turnInto3D(parsePath(leftAlignedText)),
				color: 'black',
				centerPoint: [0, 0, 0, 1] as Vector4D,
				strokeWidth: 0,
				strokeColor: 'black',
				description: 'text',
				crispEdges: false,
			},
			[0, 0, 0, 1],
			'text',
		),
		faceTransformations,
	);

	let sourceFileIconPath = genericFileIconPath;
	if (phrase.endsWith('.mp4')) {
		sourceFileIconPath = videoFileIconPath;
	} else if (phrase.endsWith('.png') || phrase.endsWith('.gif')) {
		sourceFileIconPath = imageFileIconPath;
	} else if (phrase.endsWith('.wav')) {
		sourceFileIconPath = audioFileIconPath;
	}

	const fileIconPath = resetPath(
		scalePath(sourceFileIconPath, 0.07 * 7.5, 0.07 * 7.5),
	);
	const fileIconBoundingBox = getBoundingBox(fileIconPath);
	const fileIconWidth = fileIconBoundingBox.x2 - fileIconBoundingBox.x1;
	const fileIconHeight = fileIconBoundingBox.y2 - fileIconBoundingBox.y1;
	const rightAlignedFileIconPath = translatePath(
		fileIconPath,
		boxWidth / 2 - 20 * 7.5 - fileIconWidth,
		-fileIconHeight / 2,
	);

	const fileIconFace = transformElement(
		makeElement(
			{
				points: turnInto3D(parsePath(rightAlignedFileIconPath)),
				color: 'black',
				centerPoint: [0, 0, 0, 1] as Vector4D,
				strokeWidth: 0,
				strokeColor: 'black',
				description: 'file icon',
				crispEdges: false,
			},
			[0, 0, 0, 1],
			'file-icon',
		),
		faceTransformations,
	);

	const projected = transformElements(
		[extruded, progressFace, textFace, fileIconFace],
		[rotateX(rotation), ...transformations],
	);

	return projected;
};
