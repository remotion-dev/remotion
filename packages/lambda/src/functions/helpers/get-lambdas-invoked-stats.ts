import {_Object} from '@aws-sdk/client-s3';
import {RenderInternals} from '@remotion/renderer';
import {lambdaInitializedPrefix} from '../../shared/constants';

export const getLambdasInvokedStats = (
	contents: _Object[],
	renderId: string,
	estimatedInvokations: number | null,
	startDate: number | null
) => {
	const lambdasInvoked = contents.filter((c) =>
		c.Key?.startsWith(lambdaInitializedPrefix(renderId))
	);
	const allLambdasInvoked = lambdasInvoked.length === estimatedInvokations;

	// TODO: Doesn't work while in cleanup, progress goes backwards
	const timeToInvokeLambdas =
		allLambdasInvoked && startDate
			? RenderInternals.max(
					lambdasInvoked.map((l) => l.LastModified?.getTime() as number)
			  ) - startDate
			: null;

	return {
		timeToInvokeLambdas,
		allLambdasInvoked,
		lambdasInvoked: lambdasInvoked.length,
	};
};
