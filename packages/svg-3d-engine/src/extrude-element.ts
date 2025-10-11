import type {Instruction} from '@remotion/paths';
import type {ThreeDReducedInstruction} from './3d-svg';
import {turnInto3D} from './fix-z';
import type {FaceType} from './map-face';
import {transformFace, translateSvgInstruction} from './map-face';
import type {MatrixTransform4D, Vector4D} from './matrix';
import {translateZ} from './matrix';
import {subdivideInstructions} from './subdivide-instructions';
import {truthy} from './truthy';

const inverseInstruction = (
	instruction: ThreeDReducedInstruction,
	comingFrom: Vector4D,
): ThreeDReducedInstruction => {
	if (instruction.type === 'M') {
		return {
			type: 'M',
			point: comingFrom,
		};
	}

	if (instruction.type === 'L') {
		return {
			type: 'L',
			point: comingFrom,
		};
	}

	if (instruction.type === 'C') {
		return {
			type: 'C',
			point: comingFrom,
			cp1: instruction.cp2,
			cp2: instruction.cp1,
		};
	}

	if (instruction.type === 'Q') {
		return {
			type: 'Q',
			point: comingFrom,
			cp: instruction.cp,
		};
	}

	if (instruction.type === 'Z') {
		return {
			type: 'L',
			point: comingFrom,
		};
	}

	throw new Error('Unknown instruction type');
};

type ExtrudeElementOptions = {
	depth: number;
	sideColor: string;
	points: Instruction[];
	description?: string;
	crispEdges: boolean;
};

export const extrudeElement = ({
	depth,
	sideColor,
	points,
	crispEdges,
}: ExtrudeElementOptions): FaceType[] => {
	const threeD = turnInto3D(points);
	const instructions: FaceType = {
		centerPoint: [0, 0, 0, 1],
		points: subdivideInstructions(
			subdivideInstructions(subdivideInstructions(threeD)),
		),
		color: 'black',
		crispEdges,
	};

	const unscaledBackFace = transformFace(instructions, [translateZ(depth / 2)]);

	const inbetween = unscaledBackFace.points.map((t, i): FaceType => {
		const nextInstruction =
			i === unscaledBackFace.points.length - 1
				? unscaledBackFace.points[0]
				: unscaledBackFace.points[i + 1];

		const currentPoint = t.point;
		const nextPoint = nextInstruction.point;
		const movingOver: Vector4D = [
			nextPoint[0],
			nextPoint[1],
			nextPoint[2] - depth,
			nextPoint[3],
		];

		const translatedInstruction = translateSvgInstruction(
			inverseInstruction(nextInstruction, currentPoint),
			0,
			0,
			-depth,
		);
		const newInstructions: ThreeDReducedInstruction[] = [
			{
				type: 'M' as const,
				point: currentPoint,
			},
			nextInstruction,
			nextInstruction.type === 'Z'
				? {
						type: 'M' as const,
						point: nextInstruction.point,
					}
				: null,
			{
				type: 'L' as const,
				point: movingOver,
			},
			translatedInstruction,
			{
				type: 'L' as const,
				point: currentPoint,
			},
		].filter(truthy);

		return {
			points: newInstructions,
			color: sideColor,
			centerPoint: [0, 0, 0, 1],
			crispEdges: true,
		};
	});

	return inbetween;
};

export const extrudeAndTransformElement = (
	options: ExtrudeElementOptions & {
		transformations: MatrixTransform4D;
	},
): FaceType[] => {
	const inbetween = extrudeElement(options);

	return inbetween.map((face) => ({
		...transformFace(face, [options.transformations]),
	}));
};
