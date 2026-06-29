import {
	getBoundingBox,
	parsePath,
	resetPath,
	scalePath,
	translatePath,
} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {Font} from 'opentype.js';
import {interpolate, spring} from 'remotion';
import {centerPath} from '../center';
import {makeElement, ThreeDElement, transformElement} from '../element';
import {turnInto3D} from '../fix-z';
import {getText} from '../get-char';
import {extrudeElement} from '../join-inbetween-tiles';
import {transformElements} from '../map-face';
import {MatrixTransform4D, rotateX, translateZ, Vector4D} from '../matrix';
import {makeRoundedProgress} from './make-rounded-progress';

const outerCornerRadius = 30 * 7.5;
const padding = 0;
const outerWidth = 300 * 7.5;
const outerHeight = 100 * 7.5;

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
	const rect = makeRect({
		height: outerHeight,
		width: outerWidth,
		cornerRadius: outerCornerRadius,
	});

	const turn = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 40 + delay,
	});

	const evolve = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 40,
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
		frontFaceColor: 'black',
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
			'progress'
		),
		[translateZ(-depth / 2 - 0.0001)]
	);

	const scaled = resetPath(scalePath(text.path, 0.4 * 7.5, 0.4 * 7.5));
	const boundingBoxText = getBoundingBox(scaled);
	const leftAlignedText = translatePath(
		scaled,
		-boxWidth / 2 + 20 * 7.5,
		-boundingBoxText.y2 / 2
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
			'text'
		),
		faceTransformations
	);

	const folderPath = resetPath(
		scalePath(
			'M0 96C0 60.7 28.7 32 64 32H196.1c19.1 0 37.4 7.6 50.9 21.1L289.9 96H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16H286.6c-10.6 0-20.8-4.2-28.3-11.7L213.1 87c-4.5-4.5-10.6-7-17-7H64z',
			0.07 * 7.5,
			0.07 * 7.5
		)
	);

	const folderFace = transformElement(
		makeElement(
			{
				points: turnInto3D(
					parsePath(translatePath(folderPath, 95 * 7.5, -15 * 7.5))
				),
				color: 'black',
				centerPoint: [0, 0, 0, 1] as Vector4D,
				strokeWidth: 0,
				strokeColor: 'black',
				description: 'folder',
				crispEdges: false,
			},
			[0, 0, 0, 1],
			'folder'
		),
		faceTransformations
	);

	const projected = transformElements(
		[extruded, progressFace, textFace, folderFace],
		[rotateX(rotation), ...transformations]
	);

	return projected;
};
