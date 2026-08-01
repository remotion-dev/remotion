// Remotion exports all videos with 2 channels.
export const TARGET_NUMBER_OF_CHANNELS = 2;

export const getTargetSampleRate = () => {
	if (typeof window !== 'undefined' && window.remotion_sampleRate) {
		return window.remotion_sampleRate;
	}

	return 48000;
};
