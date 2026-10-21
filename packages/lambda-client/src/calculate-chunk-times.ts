import {max, min} from './min-max';
import type {ParsedTiming} from './types';

const getAbsoluteTime = (parsedTimings: ParsedTiming[]) => {
	if (parsedTimings.length === 0) {
		return 0;
	}

	const allEnds = parsedTimings.map((p) => p.rendered);
	const allStarts = parsedTimings.map((p) => p.start);

	const biggestEnd = max(allEnds);
	const smallestStart = min(allStarts);

	return Math.max(0, biggestEnd - smallestStart);
};

export const calculateChunkTimes = ({
	type,
	timings,
}: {
	type: 'combined-time-for-cost-calculation' | 'absolute-time';
	timings: ParsedTiming[];
}) => {
	const parsedTimings = timings;

	const absoluteTime = getAbsoluteTime(parsedTimings);

	if (type === 'combined-time-for-cost-calculation') {
		const totalEncodingTimings = parsedTimings
			.map((p) => Math.max(0, p.rendered - p.start))
			.reduce((a, b) => a + b, 0);

		return totalEncodingTimings + absoluteTime;
	}

	if (type === 'absolute-time') {
		return absoluteTime;
	}

	throw new Error('invalid time for calculate chunk times');
};
