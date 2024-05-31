import {validateDimension} from '../validate';

let passedWidth: number | null = null;

export const overrideWidth = (newWidth: number) => {
	if (typeof newWidth !== 'number') {
		validateDimension(newWidth, 'width', 'passed to `setWidth()`');
	}

	passedWidth = newWidth;
};

export const getWidth = (): number | null => {
	return passedWidth;
};
