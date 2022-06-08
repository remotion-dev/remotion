import {RenderInternals} from '@remotion/renderer';
import {canUseOptimization} from './can-use-optimization';
import {OptimizationProfile} from './types';

export const planFrameRanges = ({
	chunkCount,
	framesPerLambda,
	optimization,
	shouldUseOptimization,
	frameRange,
	durationInFrames,
	everyNthFrame,
}: {
	chunkCount: number;
	framesPerLambda: number;
	optimization: OptimizationProfile | null;
	shouldUseOptimization: boolean;
	frameRange: [number, number];
	durationInFrames: number;
	everyNthFrame: number;
}): {chunks: [number, number][]; didUseOptimization: boolean} => {
	if (
		canUseOptimization({
			optimization,
			framesPerLambda,
			frameRange,
		}) &&
		shouldUseOptimization
	) {
		return {
			chunks: (optimization as OptimizationProfile).ranges,
			didUseOptimization: true,
		};
	}

	const frameCount = RenderInternals.getDurationFromFrameRange(
		frameRange,
		durationInFrames,
		everyNthFrame
	);

	return {
		chunks: new Array(chunkCount).fill(1).map((_, i) => {
			return [
				i * framesPerLambda + frameRange[0],
				Math.min(frameCount, (i + 1) * framesPerLambda) - 1 + frameRange[0],
			];
		}),
		didUseOptimization: false,
	};
};
