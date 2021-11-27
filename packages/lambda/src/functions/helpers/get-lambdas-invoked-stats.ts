import {_Object} from '@aws-sdk/client-s3';
import {lambdaInitializedPrefix} from '../../shared/constants';
import {parseLambdaInitializedKey} from '../../shared/parse-lambda-initialized-key';
import {max} from './min-max';

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
	const lambdasInvoked = contents
		.filter((c) => c.Key?.startsWith(lambdaInitializedPrefix(renderId)))
		.filter((c) => parseLambdaInitializedKey(c.Key as string).attempt === 1);
	const allLambdasInvoked =
		lambdasInvoked.length === estimatedRenderLambdaInvokations;

	const timeToInvokeLambdas =
		allLambdasInvoked && startDate
			? max(lambdasInvoked.map((l) => l.LastModified?.getTime() as number)) -
			  startDate
			: null;

	return {
		timeToInvokeLambdas,
		allLambdasInvoked,
		lambdasInvoked: lambdasInvoked.length,
	};
};
