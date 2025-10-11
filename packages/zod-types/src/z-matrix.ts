import {z} from 'zod';

export const REMOTION_MATRIX_BRAND = '__remotion-matrix';

export const zMatrix = () =>
	z
		.array(z.number().step(0.01))
		.refine(
			(value) => {
				const count = value.length;
				const root = Math.sqrt(count);
				return Number.isInteger(root) && root > 0;
			},
			{message: 'Invalid matrix, must be a square matrix'},
		)
		.describe(REMOTION_MATRIX_BRAND);
