import {NoReactInternals} from 'remotion/no-react';
import {z} from 'zod';

export const REMOTION_COLOR_BRAND = '__remotion-color';

export const parseColor = (value: string) => {
	const colored = NoReactInternals.processColor(value)
		.toString(16)
		.padStart(8, '0');

	const opacity = parseInt(colored.slice(0, 2), 16);

	const r = parseInt(colored.slice(2, 4), 16);
	const g = parseInt(colored.slice(4, 6), 16);
	const b = parseInt(colored.slice(6, 8), 16);

	return {a: opacity, r, g, b};
};

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
