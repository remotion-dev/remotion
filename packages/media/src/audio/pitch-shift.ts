import type {AudioBufferSlice} from '../make-iterator-with-priming';

// The pitch-shifting algorithm is adapted from Vanilagy's WSOLA audio
// stretcher: https://gist.github.com/Vanilagy/05f7901f4c4398356657e3a86c7aee05
const REFERENCE_SAMPLE_RATE = 48_000;
const REFERENCE_HOP_SIZE = 512;

type PlanarAudio = Float32Array[];

const makePlanarAudio = (numberOfChannels: number, length: number) => {
	return new Array(numberOfChannels)
		.fill(null)
		.map(() => new Float32Array(length));
};

const ensurePlanarCapacity = ({
	buffers,
	requiredLength,
}: {
	buffers: PlanarAudio;
	requiredLength: number;
}) => {
	if (buffers[0].length >= requiredLength) {
		return buffers;
	}

	let newLength = buffers[0].length;
	while (newLength < requiredLength) {
		newLength *= 2;
	}

	return buffers.map((buffer) => {
		const expanded = new Float32Array(newLength);
		expanded.set(buffer);
		return expanded;
	});
};

class PlanarAudioQueue {
	private chunks: PlanarAudio[] = [];
	private length = 0;

	public push(audio: PlanarAudio) {
		if (audio[0].length === 0) {
			return;
		}

		this.chunks.push(audio);
		this.length += audio[0].length;
	}

	public take(numberOfFrames: number, numberOfChannels: number): PlanarAudio {
		const framesToTake = Math.min(numberOfFrames, this.length);
		const result = makePlanarAudio(numberOfChannels, framesToTake);
		let written = 0;

		while (written < framesToTake) {
			const first = this.chunks[0];
			const available = first[0].length;
			const count = Math.min(available, framesToTake - written);

			for (let channel = 0; channel < numberOfChannels; channel++) {
				result[channel].set(first[channel].subarray(0, count), written);
			}

			if (count === available) {
				this.chunks.shift();
			} else {
				this.chunks[0] = first.map((channel) => channel.subarray(count));
			}

			written += count;
			this.length -= count;
		}

		return result;
	}

	public getLength() {
		return this.length;
	}
}

// A streaming implementation of Waveform Similarity Overlap-Add. It changes
// duration while retaining pitch. Pitch shifting is achieved by following this
// stage with a resampler that restores the original duration.
class StreamingTimeStretcher {
	private readonly numberOfChannels: number;
	private readonly factor: number;
	private readonly hopSize: number;
	private readonly windowSize: number;
	private readonly searchRadius: number;
	private readonly analysisHop: number;
	private input: PlanarAudio;
	private inputLength = 0;
	private output: PlanarAudio;
	private outputLength = 0;
	private analysisPosition = 0;
	private synthesisPosition = 0;
	private initialized = false;
	private finalized = false;
	private totalInputFrames = 0;
	private totalOutputFrames = 0;

	public constructor({
		numberOfChannels,
		sampleRate,
		factor,
	}: {
		numberOfChannels: number;
		sampleRate: number;
		factor: number;
	}) {
		this.numberOfChannels = numberOfChannels;
		this.factor = factor;
		this.hopSize = Math.max(
			32,
			Math.round((REFERENCE_HOP_SIZE * sampleRate) / REFERENCE_SAMPLE_RATE),
		);
		this.windowSize = this.hopSize * 2;
		this.searchRadius = this.hopSize;
		this.analysisHop = this.hopSize / factor;
		this.input = makePlanarAudio(numberOfChannels, 65_536);
		this.output = makePlanarAudio(numberOfChannels, 65_536);
	}

	public append(audio: PlanarAudio) {
		if (this.finalized) {
			throw new Error(
				'Cannot append audio after the time stretcher was finalized.',
			);
		}

		const {length} = audio[0];
		this.input = ensurePlanarCapacity({
			buffers: this.input,
			requiredLength: this.inputLength + length,
		});

		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			this.input[channel].set(audio[channel], this.inputLength);
		}

		this.inputLength += length;
		this.totalInputFrames += length;
		this.process();
		return this.drainFinalizedOutput();
	}

	private findBestAnalysisPosition({
		expectedPosition,
		nextSynthesisPosition,
	}: {
		expectedPosition: number;
		nextSynthesisPosition: number;
	}) {
		const minimum = Math.max(
			0,
			Math.floor(expectedPosition - this.searchRadius),
		);
		const maximum = Math.min(
			this.inputLength - this.windowSize,
			Math.ceil(expectedPosition + this.searchRadius),
		);

		let bestPosition = minimum;
		let bestCorrelation = -Infinity;

		for (let candidate = minimum; candidate <= maximum; candidate += 4) {
			let dotProduct = 0;
			let previousEnergy = 0;
			let candidateEnergy = 0;

			for (let channel = 0; channel < this.numberOfChannels; channel++) {
				const previous = this.output[channel];
				const incoming = this.input[channel];
				for (let frame = 0; frame < this.hopSize; frame += 2) {
					const previousValue = previous[nextSynthesisPosition + frame];
					const candidateValue = incoming[candidate + frame];
					dotProduct += previousValue * candidateValue;
					previousEnergy += previousValue * previousValue;
					candidateEnergy += candidateValue * candidateValue;
				}
			}

			const correlation =
				dotProduct /
				(Math.sqrt(previousEnergy * candidateEnergy) || Number.EPSILON);
			if (correlation > bestCorrelation) {
				bestCorrelation = correlation;
				bestPosition = candidate;
			}
		}

		const fineMinimum = Math.max(minimum, bestPosition - 4);
		const fineMaximum = Math.min(maximum, bestPosition + 4);
		for (let candidate = fineMinimum; candidate <= fineMaximum; candidate++) {
			let dotProduct = 0;
			let previousEnergy = 0;
			let candidateEnergy = 0;

			for (let channel = 0; channel < this.numberOfChannels; channel++) {
				const previous = this.output[channel];
				const incoming = this.input[channel];
				for (let frame = 0; frame < this.hopSize; frame++) {
					const previousValue = previous[nextSynthesisPosition + frame];
					const candidateValue = incoming[candidate + frame];
					dotProduct += previousValue * candidateValue;
					previousEnergy += previousValue * previousValue;
					candidateEnergy += candidateValue * candidateValue;
				}
			}

			const correlation =
				dotProduct /
				(Math.sqrt(previousEnergy * candidateEnergy) || Number.EPSILON);
			if (correlation > bestCorrelation) {
				bestCorrelation = correlation;
				bestPosition = candidate;
			}
		}

		return bestPosition;
	}

	private process() {
		if (!this.initialized) {
			if (this.inputLength < this.windowSize + this.searchRadius) {
				return;
			}

			for (let channel = 0; channel < this.numberOfChannels; channel++) {
				this.output[channel].set(
					this.input[channel].subarray(0, this.windowSize),
				);
			}

			this.outputLength = this.windowSize;
			this.initialized = true;
		}

		while (true) {
			const expectedPosition = this.analysisPosition + this.analysisHop;
			if (
				expectedPosition + this.searchRadius + this.windowSize >
				this.inputLength
			) {
				break;
			}

			const nextSynthesisPosition = this.synthesisPosition + this.hopSize;
			this.output = ensurePlanarCapacity({
				buffers: this.output,
				requiredLength: nextSynthesisPosition + this.windowSize,
			});
			const bestPosition = this.findBestAnalysisPosition({
				expectedPosition,
				nextSynthesisPosition,
			});

			for (let channel = 0; channel < this.numberOfChannels; channel++) {
				for (let frame = 0; frame < this.hopSize; frame++) {
					const fadeIn =
						0.5 - 0.5 * Math.cos((Math.PI * (frame + 1)) / (this.hopSize + 1));
					const outputIndex = nextSynthesisPosition + frame;
					this.output[channel][outputIndex] =
						this.output[channel][outputIndex] * (1 - fadeIn) +
						this.input[channel][bestPosition + frame] * fadeIn;
				}

				this.output[channel].set(
					this.input[channel].subarray(
						bestPosition + this.hopSize,
						bestPosition + this.windowSize,
					),
					nextSynthesisPosition + this.hopSize,
				);
			}

			// Keep the analysis clock independent from the correlation correction.
			// Periodic signals can have equally good matches at an earlier period; if
			// the correction became the next clock position, the iterator could stop
			// making forward progress.
			this.analysisPosition = expectedPosition;
			this.synthesisPosition = nextSynthesisPosition;
			this.outputLength = nextSynthesisPosition + this.windowSize;
		}
	}

	private drainFinalizedOutput() {
		if (!this.initialized) {
			return makePlanarAudio(this.numberOfChannels, 0);
		}

		const finalizedLength = Math.max(0, this.synthesisPosition + this.hopSize);
		const result = this.output.map((channel) =>
			channel.slice(0, finalizedLength),
		);
		this.totalOutputFrames += finalizedLength;

		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			this.output[channel].copyWithin(0, finalizedLength, this.outputLength);
		}

		this.outputLength -= finalizedLength;
		this.synthesisPosition -= finalizedLength;

		const inputFramesToDiscard = Math.max(
			0,
			Math.floor(this.analysisPosition) - this.searchRadius,
		);
		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			this.input[channel].copyWithin(0, inputFramesToDiscard, this.inputLength);
		}

		this.inputLength -= inputFramesToDiscard;
		this.analysisPosition -= inputFramesToDiscard;
		return result;
	}

	public finalize() {
		if (this.finalized) {
			throw new Error('The time stretcher has already been finalized.');
		}

		this.finalized = true;
		const targetLength = Math.round(this.totalInputFrames * this.factor);
		const padding = makePlanarAudio(
			this.numberOfChannels,
			this.windowSize + this.searchRadius * 2,
		);
		this.input = ensurePlanarCapacity({
			buffers: this.input,
			requiredLength: this.inputLength + padding[0].length,
		});
		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			this.input[channel].set(padding[channel], this.inputLength);
		}

		this.inputLength += padding[0].length;
		this.process();
		const finalized = this.drainFinalizedOutput();
		const remaining = Math.max(
			0,
			targetLength - this.totalOutputFrames + finalized[0].length,
		);

		if (finalized[0].length >= remaining) {
			return finalized.map((channel) => channel.slice(0, remaining));
		}

		const result = makePlanarAudio(this.numberOfChannels, remaining);
		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			result[channel].set(finalized[channel]);
		}

		return result;
	}
}

class StreamingLinearResampler {
	private readonly numberOfChannels: number;
	private readonly step: number;
	private input: PlanarAudio;
	private inputLength = 0;
	private position = 0;

	public constructor({
		numberOfChannels,
		step,
	}: {
		numberOfChannels: number;
		step: number;
	}) {
		this.numberOfChannels = numberOfChannels;
		this.step = step;
		this.input = makePlanarAudio(numberOfChannels, 65_536);
	}

	public append(audio: PlanarAudio) {
		this.input = ensurePlanarCapacity({
			buffers: this.input,
			requiredLength: this.inputLength + audio[0].length,
		});
		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			this.input[channel].set(audio[channel], this.inputLength);
		}

		this.inputLength += audio[0].length;
		return this.process(false);
	}

	private process(finalizing: boolean) {
		const outputLength = Math.max(
			0,
			Math.floor(
				(this.inputLength - (finalizing ? 0 : 1) - this.position) / this.step,
			) + 1,
		);
		const result = makePlanarAudio(this.numberOfChannels, outputLength);

		for (let outputFrame = 0; outputFrame < outputLength; outputFrame++) {
			const leftIndex = Math.floor(this.position);
			const rightIndex = Math.min(leftIndex + 1, this.inputLength - 1);
			const fraction = this.position - leftIndex;
			for (let channel = 0; channel < this.numberOfChannels; channel++) {
				const left = this.input[channel][leftIndex];
				const right = this.input[channel][rightIndex];
				result[channel][outputFrame] = left + (right - left) * fraction;
			}

			this.position += this.step;
		}

		const discard = Math.min(Math.floor(this.position), this.inputLength);
		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			this.input[channel].copyWithin(0, discard, this.inputLength);
		}

		this.inputLength -= discard;
		this.position -= discard;
		return result;
	}

	public finalize() {
		return this.process(true);
	}
}

export class StreamingPitchShifter {
	private readonly numberOfChannels: number;
	private readonly stretcher: StreamingTimeStretcher;
	private readonly resampler: StreamingLinearResampler;
	private readonly outputQueue = new PlanarAudioQueue();
	private totalInputFrames = 0;
	private totalOutputFrames = 0;

	public constructor({
		numberOfChannels,
		sampleRate,
		toneFrequency,
	}: {
		numberOfChannels: number;
		sampleRate: number;
		toneFrequency: number;
	}) {
		this.numberOfChannels = numberOfChannels;
		this.stretcher = new StreamingTimeStretcher({
			numberOfChannels,
			sampleRate,
			factor: toneFrequency,
		});
		this.resampler = new StreamingLinearResampler({
			numberOfChannels,
			step: toneFrequency,
		});
	}

	public append(audio: PlanarAudio) {
		this.totalInputFrames += audio[0].length;
		const stretched = this.stretcher.append(audio);
		this.outputQueue.push(this.resampler.append(stretched));
		return this.takeAvailableOutput();
	}

	private takeAvailableOutput() {
		const availableInputFrames = this.totalInputFrames - this.totalOutputFrames;
		const framesToTake = Math.min(
			availableInputFrames,
			this.outputQueue.getLength(),
		);
		const result = this.outputQueue.take(framesToTake, this.numberOfChannels);
		this.totalOutputFrames += framesToTake;
		return result;
	}

	public finalize() {
		this.outputQueue.push(this.resampler.append(this.stretcher.finalize()));
		this.outputQueue.push(this.resampler.finalize());
		const remaining = this.totalInputFrames - this.totalOutputFrames;
		const available = this.outputQueue.take(
			Math.min(remaining, this.outputQueue.getLength()),
			this.numberOfChannels,
		);
		const result = makePlanarAudio(this.numberOfChannels, remaining);
		for (let channel = 0; channel < this.numberOfChannels; channel++) {
			result[channel].set(available[channel]);
		}

		this.totalOutputFrames += remaining;
		return result;
	}
}

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
	audio: PlanarAudio;
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

	let shifter: StreamingPitchShifter | null = null;
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
			shifter = new StreamingPitchShifter({
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
