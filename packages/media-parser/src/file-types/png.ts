import type {Dimensions} from '../get-dimensions';
import {matchesPattern} from './detect-file-type';

export function getPngDimensions(
	pngData: Uint8Array,
): {width: number; height: number} | null {
	if (pngData.length < 24) {
		// PNG header (8) + IHDR chunk (16) minimum
		return null;
	}

	const view = new DataView(pngData.buffer, pngData.byteOffset);

	// Check PNG signature
	const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
	for (let i = 0; i < 8; i++) {
		if (pngData[i] !== pngSignature[i]) {
			return null;
		}
	}

	return {
		width: view.getUint32(16, false), // false = big-endian
		height: view.getUint32(20, false), // false = big-endian
	};
}

export const isPng = (data: Uint8Array): PngType | null => {
	const pngPattern = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

	if (matchesPattern(pngPattern)(data.subarray(0, 4))) {
		const png = getPngDimensions(data);
		return {dimensions: png, type: 'png'};
	}

	return null;
};

export type PngType = {
	type: 'png';
	dimensions: Dimensions | null;
};
