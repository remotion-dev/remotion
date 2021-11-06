import {_Object} from '@aws-sdk/client-s3';
import {RenderInternals} from '@remotion/renderer';
import {lambdaTimingsPrefix} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';

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
			.map((p) => p.encoded - p.start)
			.reduce((a, b) => a + b, 0);

		return totalEncodingTimings;
	}

	if (type === 'absolute-time') {
		if (parsedTimings.length === 0) {
			return 0;
		}

		const allEnds = parsedTimings.map((p) => p.encoded);
		const allStarts = parsedTimings.map((p) => p.start);

		const biggestEnd = RenderInternals.max(allEnds);
		const smallestStart = RenderInternals.min(allStarts);

		return biggestEnd - smallestStart;
	}

	throw new Error('invalid time for calculate chunk times');
};
