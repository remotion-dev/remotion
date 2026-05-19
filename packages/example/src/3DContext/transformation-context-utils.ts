import type {MatrixTransform4D, Vector4D} from '@remotion/svg-3d-engine';

export function transformPoint({
	matrix,
	point,
}: {
	matrix: MatrixTransform4D;
	point: Vector4D;
}): Vector4D {
	const [x, y, z, w] = point;
	const result: number[] = [];

	for (let i = 0; i < 4; i++) {
		result[i] =
			matrix[4 * i + 0] * x +
			matrix[4 * i + 1] * y +
			matrix[4 * i + 2] * z +
			matrix[4 * i + 3] * w;
	}
	return [result[0], result[1], result[2], result[3]];
}

export const isTranslateXYTransform = (
	transform: MatrixTransform4D,
): boolean => {
	return (
		transform[0] === 1 &&
		transform[1] === 0 &&
		transform[2] === 0 &&
		transform[4] === 0 &&
		transform[5] === 1 &&
		transform[6] === 0 &&
		transform[8] === 0 &&
		transform[9] === 0 &&
		transform[10] === 1 &&
		transform[11] === 0 &&
		transform[12] === 0 &&
		transform[13] === 0 &&
		transform[14] === 0 &&
		transform[15] === 1
	);
};
