import type {Crf} from '@remotion/renderer';

let currentCrf: Crf;

export const setCrf = (newCrf: Crf) => {
	if (typeof newCrf !== 'number' && newCrf !== undefined) {
		throw new TypeError('The CRF must be a number or undefined.');
	}

	currentCrf = newCrf;
};

export const getCrfOrUndefined = () => {
	return currentCrf;
};
