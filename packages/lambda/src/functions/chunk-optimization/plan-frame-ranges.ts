import {canUseOptimization} from './can-use-optimization';
import {OptimizationProfile} from './types';

export const planFrameRanges = ({
	chunkCount,
	framesPerLambda,
	frameCount,
	optimization,
	shouldUseOptimization,
}: {
	chunkCount: number;
	framesPerLambda: number;
	frameCount: number;
	optimization: OptimizationProfile | null;
	shouldUseOptimization: boolean;
}): {chunks: [number, number][]; didUseOptimization: boolean} => {
	if (
		canUseOptimization({optimization, framesPerLambda, frameCount}) &&
		shouldUseOptimization
	) {
		return {
			chunks: (optimization as OptimizationProfile).frameRange,
			didUseOptimization: true,
		};
	}

	return {
		chunks: new Array(chunkCount).fill(1).map((_, i) => {
			return [
				i * framesPerLambda,
				Math.min(frameCount, (i + 1) * framesPerLambda) - 1,
			];
		}),
		didUseOptimization: false,
	};
};
