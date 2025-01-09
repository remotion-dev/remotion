import type {Dimensions} from '../get-dimensions';
import {matchesPattern} from './detect-file-type';

function getBmpDimensions(
	bmpData: Uint8Array,
): {width: number; height: number} | null {
	if (bmpData.length < 26) {
		return null;
	}

	const view = new DataView(bmpData.buffer, bmpData.byteOffset);

	return {
		width: view.getUint32(18, true),
		height: Math.abs(view.getInt32(22, true)),
	};
}

export const isBmp = (data: Uint8Array): BmpType | null => {
	const bmpPattern = new Uint8Array([0x42, 0x4d]);

	if (matchesPattern(bmpPattern)(data.subarray(0, 2))) {
		const bmp = getBmpDimensions(data);
		return {dimensions: bmp, type: 'bmp'};
	}

	return null;
};

export type BmpType = {
	type: 'bmp';
	dimensions: Dimensions | null;
};
