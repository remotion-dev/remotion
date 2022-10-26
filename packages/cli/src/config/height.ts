// eslint-disable-next-line no-restricted-imports
import {Internals} from 'remotion';

let specifiedHeight: number | null;

export const setHeight = (newHeight: number) => {
	Internals.validateDimension(newHeight, 'height', 'passed to `setHeight()`');

	specifiedHeight = newHeight;
};

export const getHeight = (): number | null => {
	return specifiedHeight;
};
