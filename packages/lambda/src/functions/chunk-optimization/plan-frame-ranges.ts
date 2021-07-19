import {OptimizationProfile} from './types';

export const planFrameRanges = ({
	chunkCount,
	chunkSize,
	frameCount,
	optimization,
}: {
	chunkCount: number;
	chunkSize: number;
	frameCount: number;
	optimization: OptimizationProfile | null;
}): {chunks: [number, number][]; didUseOptimization: boolean} => {
	if (
		optimization &&
		optimization.chunkSize === chunkSize &&
		optimization.frameCount === frameCount
	) {
		return {chunks: optimization.frameRange, didUseOptimization: true};
	}

	return {
		chunks: new Array(chunkCount).fill(1).map((_, i) => {
			return [i * chunkSize, Math.min(frameCount, (i + 1) * chunkSize) - 1];
		}),
		didUseOptimization: false,
	};
};
