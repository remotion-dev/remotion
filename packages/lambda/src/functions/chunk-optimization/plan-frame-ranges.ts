import {RenderInternals} from '@remotion/renderer';
import {canUseOptimization} from './can-use-optimization';
import type {OptimizationProfile} from './types';

export const planFrameRanges = ({
	framesPerLambda,
	optimization,
	shouldUseOptimization,
	frameRange,
	durationInFrames,
	everyNthFrame,
}: {
	framesPerLambda: number;
	optimization: OptimizationProfile | null;
	shouldUseOptimization: boolean;
	frameRange: [number, number];
	durationInFrames: number;
	everyNthFrame: number;
}): {chunks: [number, number][]; didUseOptimization: boolean} => {
	const frameCount = RenderInternals.getFramesToRender(
		frameRange,
		durationInFrames,
		everyNthFrame
	);
	const chunkCount = Math.ceil(frameCount.length / framesPerLambda);

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

	const framesToRender = RenderInternals.getFramesToRender(
		frameRange,
		durationInFrames,
		everyNthFrame
	);

	const firstFrame = frameRange[0];
	return {
		chunks: new Array(chunkCount).fill(1).map((_, i) => {
			const start = i * framesPerLambda * everyNthFrame + firstFrame;
			const end =
				Math.min(
					framesToRender[framesToRender.length - 1],
					(i + 1) * framesPerLambda * everyNthFrame
				) -
				1 +
				firstFrame;

			return [start, end];
		}),
		didUseOptimization: false,
	};
};
