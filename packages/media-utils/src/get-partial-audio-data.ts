import type {InputAudioTrack} from 'mediabunny';
import {AudioBufferSink} from 'mediabunny';

// Audio frames might have dependencies on previous and next frames so we need to decode a bit more and then discard it.
// The worst case seems to be FLAC files with a 65'535 sample window, which would be 1486.0ms at 44.1Khz.
// So let's set a threshold of 1.5 seconds.
const EXTRA_THRESHOLD_IN_SECONDS = 1.5;

export type GetPartialAudioDataProps = {
	track: InputAudioTrack;
	fromSeconds: number;
	toSeconds: number;
	channelIndex: number;
	signal: AbortSignal;
	isMatroska?: boolean;
};

export const getPartialAudioData = async ({
	track,
	fromSeconds,
	toSeconds,
	channelIndex,
	signal,
	isMatroska = false,
}: GetPartialAudioDataProps): Promise<Float32Array> => {
	if (signal.aborted) {
		throw new Error('Operation was aborted');
	}

	const audioSamples: Float32Array[] = [];

	// matroska must be decoded from the start due to limitation
	// https://www.remotion.dev/docs/media/support#matroska-limitation
	// Also request extra data beforehand to handle audio frame dependencies
	const actualFromSeconds = isMatroska
		? 0
		: Math.max(0, fromSeconds - EXTRA_THRESHOLD_IN_SECONDS);

	// mediabunny docs: constructing the sink is virtually free and does not perform any media data reads.
	const sink = new AudioBufferSink(track);

	for await (const {buffer, timestamp, duration} of sink.buffers(
		actualFromSeconds,
		toSeconds,
	)) {
		if (signal.aborted) {
			break;
		}

		const channelData = buffer.getChannelData(channelIndex);

		const bufferStartSeconds = timestamp;
		const bufferEndSeconds = timestamp + duration;

		const overlapStartSecond = Math.max(bufferStartSeconds, fromSeconds);
		const overlapEndSecond = Math.min(bufferEndSeconds, toSeconds);

		if (overlapStartSecond >= overlapEndSecond) {
			continue;
		}

		const startSampleInBuffer = Math.floor(
			(overlapStartSecond - bufferStartSeconds) * buffer.sampleRate,
		);
		const endSampleInBuffer = Math.ceil(
			(overlapEndSecond - bufferStartSeconds) * buffer.sampleRate,
		);

		const trimmedData = channelData.slice(
			startSampleInBuffer,
			endSampleInBuffer,
		);
		audioSamples.push(trimmedData);
	}

	const totalSamples = audioSamples.reduce(
		(sum, sample) => sum + sample.length,
		0,
	);
	const result = new Float32Array(totalSamples);

	let offset = 0;
	for (const audioSample of audioSamples) {
		result.set(audioSample, offset);
		offset += audioSample.length;
	}

	return result;
};
