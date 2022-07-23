import {RenderInternals} from '@remotion/renderer';

const defaultValue = undefined;
let quality: number | undefined = defaultValue;

export const setQuality = (q: number | undefined) => {
	RenderInternals.validateQuality(q);

	if (q === 0 || q === undefined) {
		quality = defaultValue;
		return;
	}

	quality = q;
};

export const getQuality = () => quality;
