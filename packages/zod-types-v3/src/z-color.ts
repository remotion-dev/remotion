import {ZodZypesInternals} from '@remotion/zod-types';
import {z} from 'zod';

const {parseColor, REMOTION_COLOR_BRAND} = ZodZypesInternals;

export const zColor = () =>
	z
		.string()
		.refine(
			(value) => {
				try {
					parseColor(value);
					return true;
				} catch {
					return false;
				}
			},
			{message: 'Invalid color'},
		)
		.describe(REMOTION_COLOR_BRAND);
