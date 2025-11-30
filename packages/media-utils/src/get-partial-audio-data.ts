import type {InputAudioTrack} from 'mediabunny';
import {AudioBufferSink} from 'mediabunny';

export type GetPartialAudioDataProps = {
	track: InputAudioTrack;
	fromSeconds: number;
	toSeconds: number;
	channelIndex: number;
	signal: AbortSignal;
};

export const getPartialAudioData = async ({
	track,
	fromSeconds,
	toSeconds,
	channelIndex,
	signal,
}: GetPartialAudioDataProps): Promise<Float32Array> => {
	if (signal.aborted) {
		throw new Error('Operation was aborted');
	}

	const audioSamples: Float32Array[] = [];

	// mediabunny docs: constructing the sink is virtually free and does not perform any media data reads.
	const sink = new AudioBufferSink(track);

	for await (const {buffer, timestamp, duration} of sink.buffers(
		fromSeconds,
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
