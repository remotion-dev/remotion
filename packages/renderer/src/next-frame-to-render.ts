import {renderPartitions} from './render-partitions';

export const nextFrameToRenderState = ({
	allFramesAndExtraFrames,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	concurrencyOrFramesToRender: _concurrency,
}: {
	allFramesAndExtraFrames: number[];
	concurrencyOrFramesToRender: number;
}) => {
	const rendered = new Map<number, boolean>();

	return {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getNextFrame: (_pageIndex: number) => {
			const nextFrame = allFramesAndExtraFrames.find((frame) => {
				return !rendered.has(frame);
			});
			if (nextFrame === undefined) {
				throw new Error('No more frames to render');
			}

			rendered.set(nextFrame, true);
			return nextFrame;
		},
		returnFrame: (frame: number) => {
			rendered.delete(frame);
		},
	};
};

type Fn = typeof nextFrameToRenderState;
export type NextFrameToRender = ReturnType<Fn>;

export const partitionedNextFrameToRenderState: Fn = ({
	allFramesAndExtraFrames,
	concurrencyOrFramesToRender: concurrency,
}) => {
	const partitions = renderPartitions({
		frames: allFramesAndExtraFrames,
		concurrency,
	});

	return {
		getNextFrame: (pageIndex) => {
			return partitions.getNextFrame(pageIndex);
		},
		returnFrame: () => {
			throw new Error(
				'retrying failed frames for partitioned rendering is not supported. Disable partitioned rendering.',
			);
		},
	};
};
