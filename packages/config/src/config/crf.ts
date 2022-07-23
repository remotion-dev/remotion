import {Codec, Crf, RenderInternals} from '@remotion/renderer';

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

export const getActualCrf = (codec: Codec) => {
	const crf =
		getCrfOrUndefined() ?? RenderInternals.getDefaultCrfForCodec(codec);
	RenderInternals.validateSelectedCrfAndCodecCombination(crf, codec);
	return crf;
};
