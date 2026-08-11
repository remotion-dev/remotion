import {makeId} from './make-id';
import type {FaceType} from './map-face';
import {transformFace} from './map-face';
import type {MatrixTransform4D, Vector4D} from './matrix';
import {multiplyMatrix, translateX, translateY, translateZ} from './matrix';

export type ThreeDElement = {
	faces: FaceType[];
	id: string;
	description: string;
	centerPoint: Vector4D;
};

export const makeElement = (
	face: FaceType | FaceType[],
	centerPoint: Vector4D,
	description: string,
): ThreeDElement => {
	return {
		faces: Array.isArray(face) ? face : [face],
		id: makeId(),
		centerPoint,
		description,
	};
};

export const transformElement = (
	element: ThreeDElement,
	transformations: MatrixTransform4D[],
): ThreeDElement => {
	return {
		...element,
		faces: element.faces.map((face) => {
			return transformFace(face, transformations);
		}),
		id: makeId(),
		centerPoint: transformations.reduce(
			(point, transformation) => multiplyMatrix(transformation, point),
			element.centerPoint,
		),
	};
};

export const transformAroundItself = (
	element: ThreeDElement,
	transformations: MatrixTransform4D[],
): ThreeDElement => {
	const actualTransformations = [
		translateX(-element.centerPoint[0]),
		translateY(-element.centerPoint[1]),
		translateZ(-element.centerPoint[2]),
		...transformations,
		translateX(element.centerPoint[0]),
		translateY(element.centerPoint[1]),
		translateZ(element.centerPoint[2]),
	];

	return {
		...element,
		faces: element.faces.map((face) => {
			return transformFace(face, actualTransformations);
		}),
		id: makeId(),
		centerPoint: transformations.reduce(
			(point, transformation) => multiplyMatrix(transformation, point),
			element.centerPoint,
		),
	};
};
