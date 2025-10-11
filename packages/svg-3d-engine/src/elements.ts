import type {FaceType} from './map-face';
import {transformFace} from './map-face';
import type {MatrixTransform4D} from './matrix';

export type ThreeDElement = {
	faces: FaceType[];
	id: string;
	description: string;
};

export const transformFaces = (
	faces: FaceType[],
	transformations: MatrixTransform4D[],
): FaceType[] => {
	return faces.map((face) => {
		return transformFace(face, transformations);
	});
};
