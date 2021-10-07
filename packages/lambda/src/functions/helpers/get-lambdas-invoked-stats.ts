import {_Object} from '@aws-sdk/client-s3';
import {RenderInternals} from '@remotion/renderer';
import {lambdaInitializedPrefix} from '../../shared/constants';

export type LambdaInvokeStats = {
	timeToInvokeLambdas: number | null;
	allLambdasInvoked: boolean;
	lambdasInvoked: number;
};

export const getLambdasInvokedStats = (
	contents: _Object[],
	renderId: string,
	estimatedRenderLambdaInvokations: number | null,
	startDate: number | null
): LambdaInvokeStats => {
	const lambdasInvoked = contents.filter((c) =>
		c.Key?.startsWith(lambdaInitializedPrefix(renderId))
	);
	const allLambdasInvoked =
		lambdasInvoked.length === estimatedRenderLambdaInvokations;

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
