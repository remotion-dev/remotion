import type {_Object} from '@aws-sdk/client-s3';
import {lambdaInitializedPrefix} from '../../shared/constants';
import {parseLambdaInitializedKey} from '../../shared/parse-lambda-initialized-key';
import {max} from './min-max';

export type LambdaInvokeStats = {
	timeToInvokeLambdas: number | null;
	lambdasInvoked: number;
};

export const getLambdasInvokedStats = ({
	contents,
	renderId,
	estimatedRenderLambdaInvokations,
	startDate,
	checkIfAllLambdasWereInvoked,
}: {
	contents: _Object[];
	renderId: string;
	estimatedRenderLambdaInvokations: number | null;
	startDate: number | null;
	checkIfAllLambdasWereInvoked: boolean;
}): LambdaInvokeStats => {
	const lambdasInvoked = contents
		.filter((c) => c.Key?.startsWith(lambdaInitializedPrefix(renderId)))
		.filter((c) => parseLambdaInitializedKey(c.Key as string).attempt === 1);

	const allLambdasInvoked =
		!checkIfAllLambdasWereInvoked ||
		lambdasInvoked.length === estimatedRenderLambdaInvokations;

	const timeToInvokeLambdas =
		!allLambdasInvoked || startDate === null
			? null
			: (max(lambdasInvoked.map((l) => l.LastModified?.getTime() as number)) ??
					0) - startDate;

	return {
		timeToInvokeLambdas,
		lambdasInvoked: lambdasInvoked.length,
	};
};
