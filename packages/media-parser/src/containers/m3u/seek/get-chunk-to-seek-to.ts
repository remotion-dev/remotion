import type {M3uChunk} from '../get-chunks';

export const getChunkToSeekTo = ({
	chunks,
	seekToSecondsToProcess,
}: {
	chunks: M3uChunk[];
	seekToSecondsToProcess: number;
}) => {
	let duration = 0;
	for (let i = 0; i < chunks.length; i++) {
		if (duration >= seekToSecondsToProcess) {
			return Math.max(0, i - 1);
		}

		duration += chunks[i].duration;
	}

	return Math.max(0, chunks.length - 1);
};
