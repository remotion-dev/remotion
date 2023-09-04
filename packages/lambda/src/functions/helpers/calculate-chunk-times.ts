import type {_Object} from '@aws-sdk/client-s3';
import {lambdaTimingsPrefix} from '../../shared/constants';
import type {ParsedTiming} from '../../shared/parse-lambda-timings-key';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import {max, min} from './min-max';

const getAbsoluteTime = (parsedTimings: ParsedTiming[]) => {
	if (parsedTimings.length === 0) {
		return 0;
	}

	const allEnds = parsedTimings.map((p) => p.rendered);
	const allStarts = parsedTimings.map((p) => p.start);

	const biggestEnd = max(allEnds);
	const smallestStart = min(allStarts);

	return (biggestEnd as number) - smallestStart;
};

export const calculateChunkTimes = ({
	contents,
	renderId,
	type,
}: {
	contents: _Object[];
	renderId: string;
	type: 'combined-time-for-cost-calculation' | 'absolute-time';
}) => {
	const parsedTimings = contents
		.filter((c) => c.Key?.startsWith(lambdaTimingsPrefix(renderId)))
		.map((f) => parseLambdaTimingsKey(f.Key as string));

	const absoluteTime = getAbsoluteTime(parsedTimings);

	if (type === 'combined-time-for-cost-calculation') {
		const totalEncodingTimings = parsedTimings
			.map((p) => p.rendered - p.start)
			.reduce((a, b) => a + b, 0);

		return totalEncodingTimings + absoluteTime;
	}

	if (type === 'absolute-time') {
		return absoluteTime;
	}

	throw new Error('invalid time for calculate chunk times');
};
