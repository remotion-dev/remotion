import type {GifType} from './detect-file-type';
import {matchesPattern} from './detect-file-type';

const getGifDimensions = (data: Uint8Array) => {
	const view = new DataView(data.buffer, data.byteOffset);

	const width = view.getUint16(6, true);
	const height = view.getUint16(8, true);

	return {width, height};
};

export const isGif = (data: Uint8Array): GifType | null => {
	const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);

	if (matchesPattern(gifPattern)(data.subarray(0, 4))) {
		return {type: 'gif', dimensions: getGifDimensions(data)};
	}

	return null;
};
