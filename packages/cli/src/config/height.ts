import {validateDimension} from '../validate';

let specifiedHeight: number | null;

export const overrideHeight = (newHeight: number) => {
	validateDimension(newHeight, 'height', 'passed to `overrideHeight()`');

	specifiedHeight = newHeight;
};

export const getHeight = (): number | null => {
	return specifiedHeight;
};
