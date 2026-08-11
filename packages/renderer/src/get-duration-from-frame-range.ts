import type {ResolvedFrameRange} from './frame-range';

export const getFramesToRender = (
	frameRange: ResolvedFrameRange | ResolvedFrameRange[],
	everyNthFrame: number,
): number[] => {
	if (everyNthFrame === 0) {
		throw new Error('everyNthFrame cannot be 0');
	}

	const ranges = Array.isArray(frameRange[0])
		? (frameRange as ResolvedFrameRange[])
		: [frameRange as ResolvedFrameRange];

	return ranges.flatMap((range) =>
		new Array(range[1] - range[0] + 1)
			.fill(true)
			.map((_, index) => {
				return index + range[0];
			})
			.filter((frame) => {
				return (frame - range[0]) % everyNthFrame === 0;
			}),
	);
};
