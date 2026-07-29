import {RenderInternals} from '@remotion/renderer';

export const planFrameRanges = ({
	framesPerFunction,
	frameRanges,
	everyNthFrame,
}: {
	framesPerFunction: number;
	frameRanges: [number, number][];
	everyNthFrame: number;
}): {chunks: [number, number][]} => {
	return {
		chunks: frameRanges.flatMap((frameRange) => {
			const framesToRender = RenderInternals.getFramesToRender(
				frameRange,
				everyNthFrame,
			);
			const chunkCount = Math.ceil(framesToRender.length / framesPerFunction);
			const firstFrame = frameRange[0];

			return new Array(chunkCount).fill(1).map((_, i) => {
				const start = i * framesPerFunction * everyNthFrame + firstFrame;
				const end = Math.min(
					framesToRender[framesToRender.length - 1],
					(i + 1) * framesPerFunction * everyNthFrame - 1 + firstFrame,
				);

				return [start, end];
			});
		}),
	};
};
