import type {PcmS16AudioData} from './convert-audiodata';
import {
	TARGET_NUMBER_OF_CHANNELS,
	getTargetSampleRate,
} from './resample-audiodata';

export type AudioResamplerInput = {
	sourceChannels: Int16Array;
	srcNumberOfChannels: number;
	sourceSampleRate: number;
	frameCount: number;
	playbackRate: number;
	timestamp: number;
	isLast: boolean;
};

export type AudioResampler = {
	resample(input: AudioResamplerInput): PcmS16AudioData;
	flush(): PcmS16AudioData | null;
};

type PreviousSamples = {
	data: Int16Array;
	numberOfFrames: number;
};

const fixFloatingPoint = (value: number) => {
	if (value % 1 < 0.0000001) {
		return Math.floor(value);
	}

	if (value % 1 > 0.9999999) {
		return Math.ceil(value);
	}

	return value;
};

/**
 * Linearly interpolate a single channel at a fractional source position.
 * Handles cross-boundary lookups via previousSamples when srcPos < 0.
 */
const interpolateSample = (
	sourceChannels: Int16Array,
	srcNumberOfChannels: number,
	frameCount: number,
	channelIndex: number,
	srcPos: number,
	previousSamples: PreviousSamples | null,
): number => {
	const lowerFrame = Math.floor(srcPos);
	const upperFrame = lowerFrame + 1;
	const fraction = srcPos - lowerFrame;

	const getSample = (frame: number) => {
		if (frame < 0) {
			const previousFrame = (previousSamples?.numberOfFrames ?? 0) + frame;
			return previousFrame >= 0 && previousSamples
				? (previousSamples.data[
						previousFrame * srcNumberOfChannels + channelIndex
					] ?? 0)
				: 0;
		}

		if (frame >= frameCount) {
			return sourceChannels[
				(frameCount - 1) * srcNumberOfChannels + channelIndex
			];
		}

		return sourceChannels[frame * srcNumberOfChannels + channelIndex];
	};

	const lowerSample = getSample(lowerFrame);
	const upperSample = getSample(upperFrame);

	return lowerSample + fraction * (upperSample - lowerSample);
};

/**
 * Get the downmixed stereo pair for a source position using linear interpolation.
 * Channel mixing formulas taken from Mediabunny's audio resampler:
 * https://github.com/Vanilagy/mediabunny/blob/b9f7ab2fa2b9167784cbded044d466185308999f/src/conversion.ts
 */
const getDownmixedStereo = (
	sourceChannels: Int16Array,
	srcNumberOfChannels: number,
	frameCount: number,
	srcPos: number,
	previousSamples: PreviousSamples | null,
): [number, number] => {
	const interp = (ch: number) =>
		interpolateSample(
			sourceChannels,
			srcNumberOfChannels,
			frameCount,
			ch,
			srcPos,
			previousSamples,
		);

	// Same channel count — direct pass-through
	if (TARGET_NUMBER_OF_CHANNELS === srcNumberOfChannels) {
		return [interp(0), interp(1)];
	}

	// Mono to Stereo: M -> L, M -> R
	if (srcNumberOfChannels === 1) {
		const m = interp(0);
		return [m, m];
	}

	// Quad to Stereo: 0.5 * (L + SL), 0.5 * (R + SR)
	if (srcNumberOfChannels === 4) {
		return [0.5 * (interp(0) + interp(2)), 0.5 * (interp(1) + interp(3))];
	}

	// 5.1 to Stereo: L + sqrt(1/2) * (C + SL), R + sqrt(1/2) * (C + SR)
	if (srcNumberOfChannels === 6) {
		const sq = Math.SQRT1_2;
		return [
			interp(0) + sq * (interp(2) + interp(4)),
			interp(1) + sq * (interp(2) + interp(5)),
		];
	}

	// Discrete fallback: direct mapping with zero-fill
	return [interp(0), srcNumberOfChannels > 1 ? interp(1) : 0];
};

export const createAudioResampler = (): AudioResampler => {
	// State carried across chunks
	let fractionalPosition = 0;
	let previousSamples: PreviousSamples | null = null;
	let pendingSourceChannels: Int16Array | null = null;
	let pendingFrameCount = 0;
	let pendingTimestamp = 0;
	let lastTimestamp: number | null = null;
	let accumulatedOutputFrames = 0;

	const resample = ({
		sourceChannels,
		srcNumberOfChannels,
		sourceSampleRate,
		frameCount,
		playbackRate,
		timestamp,
		isLast,
	}: AudioResamplerInput): PcmS16AudioData => {
		let currentSourceChannels = sourceChannels;
		let currentFrameCount = frameCount;
		let currentTimestamp = timestamp;

		if (pendingSourceChannels) {
			const combined = new Int16Array(
				pendingSourceChannels.length + sourceChannels.length,
			);
			combined.set(pendingSourceChannels);
			combined.set(sourceChannels, pendingSourceChannels.length);
			currentSourceChannels = combined;
			currentFrameCount = pendingFrameCount + frameCount;
			currentTimestamp = pendingTimestamp;
			pendingSourceChannels = null;
			pendingFrameCount = 0;
		}

		const targetSampleRate = getTargetSampleRate();
		const effectiveRatio = (sourceSampleRate / targetSampleRate) * playbackRate;
		const rawTargetFrames =
			(currentFrameCount - fractionalPosition) / effectiveRatio;
		const targetFrames = isLast
			? Math.ceil(fixFloatingPoint(rawTargetFrames))
			: Math.floor(fixFloatingPoint(rawTargetFrames));

		if (targetFrames <= 0) {
			// Not enough source data to produce even 1 frame. Preserve it until
			// the next chunk can contribute an output frame.
			pendingSourceChannels = currentSourceChannels;
			pendingFrameCount = currentFrameCount;
			pendingTimestamp = currentTimestamp;
			return {
				data: new Int16Array(0),
				numberOfFrames: 0,
				timestamp: currentTimestamp,
				durationInMicroSeconds: 0,
			};
		}

		const destination = new Int16Array(
			targetFrames * TARGET_NUMBER_OF_CHANNELS,
		);

		for (let newFrameIndex = 0; newFrameIndex < targetFrames; newFrameIndex++) {
			// Source position within this chunk. A negative position reads from
			// the unconsumed tail of the previous chunk.
			const srcPos = fractionalPosition + newFrameIndex * effectiveRatio;
			const [left, right] = getDownmixedStereo(
				currentSourceChannels,
				srcNumberOfChannels,
				currentFrameCount,
				srcPos,
				previousSamples,
			);

			destination[newFrameIndex * 2] = left;
			destination[newFrameIndex * 2 + 1] = right;
		}

		// Track the source position where the next chunk should start.
		fractionalPosition += targetFrames * effectiveRatio - currentFrameCount;
		if (Math.abs(fractionalPosition) < 1e-10) {
			fractionalPosition = 0;
		}

		const previousFrameCount = Math.min(
			currentFrameCount,
			Math.max(0, Math.ceil(-fractionalPosition)),
		);
		previousSamples =
			previousFrameCount === 0
				? null
				: {
						data: currentSourceChannels.slice(
							(currentFrameCount - previousFrameCount) * srcNumberOfChannels,
						),
						numberOfFrames: previousFrameCount,
					};

		const outputTimestamp =
			lastTimestamp === null
				? currentTimestamp
				: lastTimestamp +
					(accumulatedOutputFrames / targetSampleRate) * 1_000_000;

		if (lastTimestamp === null) {
			lastTimestamp = currentTimestamp;
		}

		accumulatedOutputFrames += targetFrames;

		return {
			data: destination,
			numberOfFrames: targetFrames,
			timestamp: fixFloatingPoint(outputTimestamp),
			durationInMicroSeconds: fixFloatingPoint(
				(targetFrames / targetSampleRate) * 1_000_000,
			),
		};
	};

	const flush = (): PcmS16AudioData | null => null;

	return {resample, flush};
};
