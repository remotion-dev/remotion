// eslint-disable-next-line no-restricted-imports
import {Internals} from 'remotion';

let passedWidth: number | null = null;

export const setWidth = (newWidth: number) => {
	if (typeof newWidth !== 'number') {
		Internals.validateDimension(newWidth, 'width', 'passed to `setWidth()`');
	}

	passedWidth = newWidth;
};

export const getWidth = (): number | null => {
	return passedWidth;
};
