import type {ParsedTiming} from './types';

export const OVERHEAD_TIME_PER_LAMBDA = 100;

export type ExpensiveChunk = {
	chunk: number;
	frameRange: [number, number];
	timeInMilliseconds: number;
};

export const getMostExpensiveChunks = ({
	parsedTimings,
	framesPerFunction: framesPerLambda,
	firstFrame,
	lastFrame,
}: {
	parsedTimings: ParsedTiming[];
	framesPerFunction: number;
	firstFrame: number;
	lastFrame: number;
}): ExpensiveChunk[] => {
	const mostExpensiveChunks = parsedTimings
		.slice(0)
		.sort((a, b) => {
			const durA = a.rendered - a.start;
			const durB = b.rendered - b.start;

			return durB - durA;
		})
		.slice(0, 5);

	return mostExpensiveChunks.map((c) => {
		const isLastChunk = c.chunk === parsedTimings.length - 1;

		return {
			timeInMilliseconds: c.rendered - c.start,
			chunk: c.chunk,
			frameRange: [
				framesPerLambda * c.chunk + firstFrame,
				isLastChunk
					? lastFrame
					: framesPerLambda * (c.chunk + 1) - 1 + firstFrame,
			],
		};
	});
};
