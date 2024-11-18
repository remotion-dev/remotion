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
	trackId: number,
): AudioOrVideoSample => {
	const arr = new Uint8Array(chunk.byteLength);
	chunk.copyTo(arr);

	return {
		data: arr,
		duration: chunk.duration ?? undefined,
		timestamp: chunk.timestamp,
		type: chunk.type,
		cts: chunk.timestamp,
		dts: chunk.timestamp,
		trackId,
	};
};
