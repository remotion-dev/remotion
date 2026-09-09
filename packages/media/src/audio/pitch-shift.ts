import {Internals} from 'remotion';
import type {AudioBufferSlice} from '../make-iterator-with-priming';

const getPlanarSlice = (slice: AudioBufferSlice) => {
	const {buffer} = slice.buffer;
	const startFrame = Math.max(
		0,
		Math.round(slice.sourceOffsetInSeconds * buffer.sampleRate),
	);
	const numberOfFrames = Math.min(
		buffer.length - startFrame,
		Math.round(slice.sourceDurationInSeconds * buffer.sampleRate),
	);

	return new Array(buffer.numberOfChannels)
		.fill(null)
		.map((_, channel) =>
			buffer
				.getChannelData(channel)
				.slice(startFrame, startFrame + numberOfFrames),
		);
};

const makeAudioBufferSlice = ({
	audio,
	timelineTimestamp,
	sampleRate,
}: {
	audio: Float32Array[];
	timelineTimestamp: number;
	sampleRate: number;
}): AudioBufferSlice => {
	const buffer = new AudioBuffer({
		length: audio[0].length,
		numberOfChannels: audio.length,
		sampleRate,
	});
	for (let channel = 0; channel < audio.length; channel++) {
		buffer.copyToChannel(new Float32Array(audio[channel]), channel);
	}

	const duration = audio[0].length / sampleRate;
	return {
		buffer: {buffer, timestamp: timelineTimestamp, duration},
		timelineTimestamp,
		sourceOffsetInSeconds: 0,
		sourceDurationInSeconds: duration,
	};
};

export async function* pitchShiftAudioIterator({
	iterator,
	toneFrequency,
}: {
	iterator: AsyncGenerator<AudioBufferSlice, void, unknown>;
	toneFrequency: number;
}): AsyncGenerator<AudioBufferSlice, void, unknown> {
	if (toneFrequency === 1) {
		yield* iterator;
		return;
	}

	let shifter: InstanceType<typeof Internals.StreamingPitchShifter> | null =
		null;
	let sampleRate = 0;
	let numberOfChannels = 0;
	let segmentStart = 0;
	let segmentInputFrames = 0;
	let segmentOutputFrames = 0;

	const flush = () => {
		if (!shifter) {
			return null;
		}

		const audio = shifter.finalize();
		const slice =
			audio[0].length === 0
				? null
				: makeAudioBufferSlice({
						audio,
						timelineTimestamp: segmentStart + segmentOutputFrames / sampleRate,
						sampleRate,
					});
		shifter = null;
		return slice;
	};

	for await (const slice of iterator) {
		const planar = getPlanarSlice(slice);
		if (planar[0].length === 0) {
			continue;
		}

		const nextSampleRate = slice.buffer.buffer.sampleRate;
		const nextNumberOfChannels = slice.buffer.buffer.numberOfChannels;
		const expectedTimestamp = segmentStart + segmentInputFrames / sampleRate;
		const startsNewSegment =
			!shifter ||
			nextSampleRate !== sampleRate ||
			nextNumberOfChannels !== numberOfChannels ||
			Math.abs(slice.timelineTimestamp - expectedTimestamp) >
				1.5 / nextSampleRate;

		if (startsNewSegment) {
			const previousSegmentFinalSlice = flush();
			if (previousSegmentFinalSlice) {
				yield previousSegmentFinalSlice;
			}

			sampleRate = nextSampleRate;
			numberOfChannels = nextNumberOfChannels;
			segmentStart = slice.timelineTimestamp;
			segmentInputFrames = 0;
			segmentOutputFrames = 0;
			shifter = new Internals.StreamingPitchShifter({
				numberOfChannels,
				sampleRate,
				toneFrequency,
			});
		}

		if (!shifter) {
			throw new Error('Pitch shifter was not initialized.');
		}

		segmentInputFrames += planar[0].length;
		const output = shifter.append(planar);
		if (output[0].length > 0) {
			yield makeAudioBufferSlice({
				audio: output,
				timelineTimestamp: segmentStart + segmentOutputFrames / sampleRate,
				sampleRate,
			});
			segmentOutputFrames += output[0].length;
		}
	}

	const finalSlice = flush();
	if (finalSlice) {
		yield finalSlice;
	}
}
