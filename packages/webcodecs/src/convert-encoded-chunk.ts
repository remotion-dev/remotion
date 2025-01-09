import type {AudioOrVideoSample} from '@remotion/media-parser';

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
		offset: 0,
		timescale: 1_000_000,
	};
};
