import {_Object} from '@aws-sdk/client-s3';
import {RenderInternals} from '@remotion/renderer';
import {lambdaTimingsPrefix} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import {max, min} from './min-max';

export const calculateChunkTimes = ({
	contents,
	renderId,
	type,
}: {
	contents: _Object[];
	renderId: string;
	type: 'combined-time-for-cost-calculation' | 'absolute-time';
}) => {
	const finishedTimings = contents.filter((c) =>
		c.Key?.startsWith(lambdaTimingsPrefix(renderId))
	);

	const parsedTimings = finishedTimings.map((f) =>
		parseLambdaTimingsKey(f.Key as string)
	);

	if (type === 'combined-time-for-cost-calculation') {
		// TODO: Should also calculate invoker functions, and main function
		const totalEncodingTimings = parsedTimings
			.map((p) => p.rendered - p.start)
			.reduce((a, b) => a + b, 0);

		return totalEncodingTimings;
	}

	if (type === 'absolute-time') {
		if (parsedTimings.length === 0) {
			return 0;
		}

		const allEnds = parsedTimings.map((p) => p.rendered);
		const allStarts = parsedTimings.map((p) => p.start);

		const biggestEnd = max(allEnds);
		const smallestStart = min(allStarts);

		return biggestEnd - smallestStart;
	}

	throw new Error('invalid time for calculate chunk times');
};
