import {OVERHEAD_TIME_PER_LAMBDA} from './most-expensive-chunks';
import type {ParsedTiming} from './types';

export const calculateBillingDuration = ({
	timings,
	functionsInvoked,
	elapsedTimeOfUnfinishedChunks,
}: {
	timings: ParsedTiming[];
	functionsInvoked: number;
	elapsedTimeOfUnfinishedChunks: number;
}) => {
	const completedChunksDuration = timings
		.map((p) => Math.max(0, p.rendered - p.start) + OVERHEAD_TIME_PER_LAMBDA)
		.reduce((a, b) => a + b, 0);

	const unfinished = Math.max(0, functionsInvoked - timings.length);

	return completedChunksDuration + unfinished * elapsedTimeOfUnfinishedChunks;
};
