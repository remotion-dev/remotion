import {parsePath, reduceInstructions} from '@remotion/paths';
import {threeDIntoSvgPath, type ThreeDReducedInstruction} from './3d-svg';
import {turnInto3D} from './fix-z';
import type {MatrixTransform4D, Vector4D} from './matrix';
import {multiplyMatrix, multiplyMatrixAndSvgInstruction} from './matrix';

export type FaceType = {
	color: string;
	points: ThreeDReducedInstruction[];
	centerPoint: Vector4D;
	crispEdges: boolean;
};

export const translateSvgInstruction = (
	instruction: ThreeDReducedInstruction,
	x: number,
	y: number,
	z: number,
): ThreeDReducedInstruction => {
	if (instruction.type === 'M') {
		return {
			type: 'M',
			point: [
				instruction.point[0] + x,
				instruction.point[1] + y,
				instruction.point[2] + z,
				instruction.point[3],
			],
		};
	}

	if (instruction.type === 'L') {
		return {
			type: 'L',
			point: [
				instruction.point[0] + x,
				instruction.point[1] + y,
				instruction.point[2] + z,
				instruction.point[3],
			],
		};
	}

	if (instruction.type === 'C') {
		return {
			type: 'C',
			point: [
				instruction.point[0] + x,
				instruction.point[1] + y,
				instruction.point[2] + z,
				instruction.point[3],
			],
			cp1: [
				instruction.cp1[0] + x,
				instruction.cp1[1] + y,
				instruction.cp1[2] + z,
				instruction.cp1[3],
			],
			cp2: [
				instruction.cp2[0] + x,
				instruction.cp2[1] + y,
				instruction.cp2[2] + z,
				instruction.cp2[3],
			],
		};
	}

	if (instruction.type === 'Q') {
		return {
			type: 'Q',
			point: [
				instruction.point[0] + x,
				instruction.point[1] + y,
				instruction.point[2] + z,
				instruction.point[3],
			],
			cp: [
				instruction.cp[0] + x,
				instruction.cp[1] + y,
				instruction.cp[2] + z,
				instruction.cp[3],
			],
		};
	}

	if (instruction.type === 'Z') {
		return {
			type: 'Z',
			point: [
				instruction.point[0] + x,
				instruction.point[1] + y,
				instruction.point[2] + z,
				instruction.point[3],
			],
		};
	}

	throw new Error('Unknown instruction type: ' + JSON.stringify(instruction));
};

export const transformPath = ({
	path,
	transformation,
}: {
	path: string;
	transformation: MatrixTransform4D;
}): string => {
	const parsed = parsePath(path);
	const reduced = reduceInstructions(parsed);
	const threeD = turnInto3D(reduced);
	return threeDIntoSvgPath(
		threeD.map((p) => {
			return multiplyMatrixAndSvgInstruction(transformation, p);
		}),
	);
};

export const transformFace = (
	face: FaceType,
	transformations: MatrixTransform4D[],
): FaceType => {
	return {
		...face,
		points: face.points.map((p) => {
			return transformations.reduce((acc, t) => {
				return multiplyMatrixAndSvgInstruction(t, acc);
			}, p);
		}),
		centerPoint: transformations.reduce((acc, t) => {
			const result = multiplyMatrix(t, acc);
			return result;
		}, face.centerPoint),
	};
};

export const transformFaces = ({
	faces,
	transformations,
}: {
	faces: FaceType[];
	transformations: MatrixTransform4D[];
}) => {
	return faces.map((face) => {
		return transformFace(face, transformations);
	});
};

export const makeFace = ({
	points,
	fill,
	crispEdges,
}: {
	points: string | ThreeDReducedInstruction[];
	strokeWidth: number;
	strokeColor: string;
	fill: string;
	crispEdges: boolean;
}): FaceType => {
	const centerPoint: Vector4D = [0, 0, 0, 1];

	return {
		centerPoint,
		color: fill,
		points: typeof points === 'string' ? turnInto3D(parsePath(points)) : points,
		crispEdges,
	};
};
