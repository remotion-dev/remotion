import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '@remotion/media-parser';

export const convertEncodedChunk = <
	T extends MediaParserAudioSample | MediaParserVideoSample,
>(
	chunk: EncodedAudioChunk | EncodedVideoChunk,
): T => {
	const arr = new Uint8Array(chunk.byteLength);
	chunk.copyTo(arr);

	return {
		data: arr,
		duration: chunk.duration ?? undefined,
		timestamp: chunk.timestamp,
		type: chunk.type,
		decodingTimestamp: chunk.timestamp,
		offset: 0,
	} as T;
};
