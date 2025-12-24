import {ALL_FORMATS, AudioBufferSink, Input, UrlSource} from 'mediabunny';

// Audio frames might have dependencies on previous and next frames so we need to decode a bit more and then discard it.
// The worst case seems to be FLAC files with a 65'535 sample window, which would be 1486.0ms at 44.1Khz.
// So let's set a threshold of 1.5 seconds.
const EXTRA_THRESHOLD_IN_SECONDS = 1.5;

export type GetPartialAudioDataProps = {
	fromSeconds: number;
	toSeconds: number;
	channelIndex: number;
	signal: AbortSignal;
	src: string;
	isMatroska: boolean;
};

export const getPartialAudioData = async ({
	fromSeconds,
	toSeconds,
	channelIndex,
	signal,
	src,
	isMatroska,
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

	const source = new UrlSource(src);

	using input = new Input({
		formats: ALL_FORMATS,
		source,
	});

	const track = await input.getPrimaryAudioTrack();

	if (!track) {
		throw new Error('No audio track found');
	}

	// mediabunny docs: constructing the sink is virtually free and does not perform any media data reads.
	const sink = new AudioBufferSink(track);

	const iterator = sink.buffers(actualFromSeconds, toSeconds);

	for await (const {buffer, timestamp, duration} of iterator) {
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

	await iterator.return();

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
