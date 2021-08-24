import {validateQuality} from '../validation/validate-quality';

const defaultValue = undefined;
let quality: number | undefined = defaultValue;

export const setQuality = (q: number | undefined) => {
	validateQuality(q);

	if (q === 0 || q === undefined) {
		quality = defaultValue;
		return;
	}

	quality = q;
};

export const getQuality = () => quality;
