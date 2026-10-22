import type {Input} from 'mediabunny';

export type VideoFrameRate =
	| {
			type: 'constant';
			rate: number;
	  }
	| {
			type: 'variable';
			rate: number;
	  };

export const getVideoFrameRate = async (
	input: Input,
): Promise<VideoFrameRate | null> => {
	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		return null;
	}

	const metrics = await videoTrack.computeFrameRateMetrics();
	if (metrics.probedPacketCount < 2) {
		return null;
	}

	return {
		type: metrics.frameRateIsConstant ? 'constant' : 'variable',
		rate: metrics.bestGuessFrameRate,
	};
};
