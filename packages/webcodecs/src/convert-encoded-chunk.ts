import type {AudioOrVideoSample} from '@remotion/media-parser';

export const combineUint8Arrays = (arrays: Uint8Array[]) => {
	if (arrays.length === 0) {
		return new Uint8Array([]);
	}

	if (arrays.length === 1) {
		return arrays[0];
	}

	let totalLength = 0;
	for (const array of arrays) {
		totalLength += array.length;
	}

	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		result.set(array, offset);
		offset += array.length;
	}

	return result;
};

export const convertEncodedChunk = (
	chunk: EncodedAudioChunk | EncodedVideoChunk,
): AudioOrVideoSample => {
	const arr = new Uint8Array(chunk.byteLength);
	chunk.copyTo(arr);

	const accessUnitDelimiter = [0x00, 0x00, 0x00, 0x02, 0x09, 0xf0];
	const sequenceParameterSet = [
		0x00, 0x00, 0x00, 0x1e, 0x67, 0x64, 0x00, 0x1e, 0xac, 0xd9, 0x40, 0xa0,
		0x2f, 0xf9, 0x70, 0x16, 0xe0, 0x40, 0x40, 0xb4, 0xa0, 0x00, 0x00, 0x03,
		0x00, 0x20, 0x00, 0x00, 0x07, 0x81, 0xe2, 0xc5, 0xb2, 0xc0,
	];
	const pps = [0x00, 0x00, 0x00, 0x06, 0x68, 0xeb, 0xe0, 0x8c, 0xb2, 0x2c];
	const addedHeader = combineUint8Arrays(
		[
			new Uint8Array(accessUnitDelimiter),
			chunk.type === 'key' ? new Uint8Array(sequenceParameterSet) : null,
			chunk.type === 'key' ? new Uint8Array(pps) : null,
			arr,
		].filter(Boolean) as Uint8Array[],
	);

	return {
		data: addedHeader,
		duration: chunk.duration ?? undefined,
		timestamp: chunk.timestamp,
		type: chunk.type,
		cts: chunk.timestamp,
		dts: chunk.timestamp,
	};
};
