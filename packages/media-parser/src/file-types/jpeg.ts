import {matchesPattern} from './detect-file-type';

export function getJpegDimensions(
	data: Uint8Array,
): {width: number; height: number} | null {
	let offset = 0;

	// Helper function to read a 16-bit big-endian integer
	function readUint16BE(o: number): number {
		return (data[o] << 8) | data[o + 1];
	}

	// Skip the Start of Image (SOI) marker
	if (readUint16BE(offset) !== 0xffd8) {
		return null; // Not a valid JPEG file
	}

	offset += 2;

	while (offset < data.length) {
		if (data[offset] === 0xff) {
			const marker = data[offset + 1];
			if (marker === 0xc0 || marker === 0xc2) {
				// SOF0 or SOF2
				const height = readUint16BE(offset + 5);
				const width = readUint16BE(offset + 7);
				return {width, height};
			}

			const length = readUint16BE(offset + 2);
			offset += length + 2; // Move to the next marker
		} else {
			offset++;
		}
	}

	return null; // Return null if dimensions are not found
}

export const isJpeg = (data: Uint8Array): JpegType | null => {
	const jpegPattern = new Uint8Array([0xff, 0xd8]);

	const jpeg = matchesPattern(jpegPattern)(data.subarray(0, 2));
	if (!jpeg) {
		return null;
	}

	const dim = getJpegDimensions(data);
	return {dimensions: dim, type: 'jpeg'};
};

export type JpegType = {
	type: 'jpeg';
	dimensions: {
		width: number;
		height: number;
	} | null;
};
