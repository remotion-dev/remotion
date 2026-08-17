// Remotion exports all videos with 2 channels.
export const TARGET_NUMBER_OF_CHANNELS = 2;

export const getTargetSampleRate = () => {
	if (typeof window !== 'undefined' && window.remotion_sampleRate) {
		return window.remotion_sampleRate;
	}

	return 48000;
};

const fixFloatingPoint = (value: number) => {
	const rounded = Math.round(value);
	if (Math.abs(value - rounded) < 0.0000001) {
		return rounded;
	}

	return value;
};

const clampToInt16 = (value: number) => {
	return Math.max(-32768, Math.min(32767, value));
};

export const resampleAudioData = ({
	srcNumberOfChannels,
	sourceChannels,
	destination,
	targetFrames,
	sourceStart,
	sourceStep,
}: {
	srcNumberOfChannels: number;
	sourceChannels: Int16Array;
	destination: Int16Array;
	targetFrames: number;
	sourceStart: number;
	sourceStep: number;
}) => {
	const sourceFrames = sourceChannels.length / srcNumberOfChannels;
	const fixedSourceStart = fixFloatingPoint(sourceStart);
	if (
		srcNumberOfChannels === TARGET_NUMBER_OF_CHANNELS &&
		sourceStep === 1 &&
		Number.isInteger(fixedSourceStart)
	) {
		const sourceOffset = Math.max(0, fixedSourceStart);
		const destinationOffset = Math.max(0, -fixedSourceStart);
		const framesToCopy = Math.min(
			targetFrames - destinationOffset,
			sourceFrames - sourceOffset,
		);
		if (framesToCopy > 0) {
			destination.set(
				sourceChannels.subarray(
					sourceOffset * TARGET_NUMBER_OF_CHANNELS,
					(sourceOffset + framesToCopy) * TARGET_NUMBER_OF_CHANNELS,
				),
				destinationOffset * TARGET_NUMBER_OF_CHANNELS,
			);
		}

		return;
	}

	const getSourceValue = (position: number, channelIndex: number) => {
		const fixedPosition = fixFloatingPoint(position);
		const lowerFrame = Math.floor(fixedPosition);
		const fraction = fixedPosition - lowerFrame;

		const lower =
			lowerFrame < 0 || lowerFrame >= sourceFrames
				? 0
				: sourceChannels[lowerFrame * srcNumberOfChannels + channelIndex];
		if (fraction === 0) {
			return lower;
		}

		const upperFrame = lowerFrame + 1;
		const upper =
			upperFrame < 0 || upperFrame >= sourceFrames
				? 0
				: sourceChannels[upperFrame * srcNumberOfChannels + channelIndex];

		return lower + fraction * (upper - lower);
	};

	for (let newFrameIndex = 0; newFrameIndex < targetFrames; newFrameIndex++) {
		const sourcePosition = sourceStart + newFrameIndex * sourceStep;
		let left = 0;
		let right = 0;

		if (srcNumberOfChannels === 1) {
			const mono = getSourceValue(sourcePosition, 0);
			left = mono;
			right = mono;
		} else if (srcNumberOfChannels === 2) {
			left = getSourceValue(sourcePosition, 0);
			right = getSourceValue(sourcePosition, 1);
		} else if (srcNumberOfChannels === 4) {
			const l = getSourceValue(sourcePosition, 0);
			const r = getSourceValue(sourcePosition, 1);
			const sl = getSourceValue(sourcePosition, 2);
			const sr = getSourceValue(sourcePosition, 3);
			left = 0.5 * (l + sl);
			right = 0.5 * (r + sr);
		} else if (srcNumberOfChannels === 6) {
			const l = getSourceValue(sourcePosition, 0);
			const r = getSourceValue(sourcePosition, 1);
			const c = getSourceValue(sourcePosition, 2);
			const sl = getSourceValue(sourcePosition, 3);
			const sr = getSourceValue(sourcePosition, 4);
			const centerAndSurroundWeight = Math.sqrt(1 / 2);
			left = l + centerAndSurroundWeight * (c + sl);
			right = r + centerAndSurroundWeight * (c + sr);
		} else {
			left = getSourceValue(sourcePosition, 0);
			right =
				srcNumberOfChannels > 1 ? getSourceValue(sourcePosition, 1) : left;
		}

		destination[newFrameIndex * TARGET_NUMBER_OF_CHANNELS] = clampToInt16(left);
		destination[newFrameIndex * TARGET_NUMBER_OF_CHANNELS + 1] =
			clampToInt16(right);
	}
};
