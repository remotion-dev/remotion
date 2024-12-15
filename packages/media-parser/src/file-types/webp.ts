import type {Dimensions} from '../get-dimensions';
import {matchesPattern} from './detect-file-type';

function getWebPDimensions(bytes: Uint8Array): Dimensions | null {
	// Check if we have enough bytes for a basic WebP header
	if (bytes.length < 30) {
		return null;
	}

	// Check WebP file signature
	// "RIFF" signature (52 49 46 46) and "WEBP" signature (57 45 42 50)
	if (
		bytes[0] !== 0x52 || // R
		bytes[1] !== 0x49 || // I
		bytes[2] !== 0x46 || // F
		bytes[3] !== 0x46 || // F
		bytes[8] !== 0x57 || // W
		bytes[9] !== 0x45 || // E
		bytes[10] !== 0x42 || // B
		bytes[11] !== 0x50 // P
	) {
		return null;
	}

	// Check for VP8 bitstream
	if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38) {
		// VP8 format
		if (bytes[15] === 0x20) {
			// Simple VP8 format
			return {
				width: bytes[26] | ((bytes[27] << 8) & 0x3fff),
				height: bytes[28] | ((bytes[29] << 8) & 0x3fff),
			};
		}
	}

	// Check for VP8L (lossless) bitstream
	if (
		bytes[12] === 0x56 &&
		bytes[13] === 0x50 &&
		bytes[14] === 0x38 &&
		bytes[15] === 0x4c
	) {
		return {
			width: 1 + (bytes[21] | ((bytes[22] & 0x3f) << 8)),
			height:
				1 +
				(((bytes[22] & 0xc0) >> 6) |
					(bytes[23] << 2) |
					((bytes[24] & 0x0f) << 10)),
		};
	}

	// Check for VP8X (extended) bitstream
	if (
		bytes[12] === 0x56 &&
		bytes[13] === 0x50 &&
		bytes[14] === 0x38 &&
		bytes[15] === 0x58
	) {
		return {
			width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
			height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
		};
	}

	return null;
}

export const isWebp = (data: Uint8Array): WebpType | null => {
	const webpPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);

	if (matchesPattern(webpPattern)(data.subarray(0, 4))) {
		return {
			type: 'webp',
			dimensions: getWebPDimensions(data),
		};
	}

	return null;
};

export type WebpType = {
	type: 'webp';
	dimensions: Dimensions | null;
};
