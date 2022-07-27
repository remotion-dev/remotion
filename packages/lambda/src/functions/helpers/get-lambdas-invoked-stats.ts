import type {_Object} from '@aws-sdk/client-s3';
import {lambdaInitializedPrefix} from '../../shared/constants';
import {max} from './min-max';

export type LambdaInvokeStats = {
	timeToInvokeLambdas: number | null;
	lambdasInvoked: number;
};

export const getLambdasInvokedStats = (
	contents: _Object[],
	renderId: string,
	startDate: number | null
): LambdaInvokeStats => {
	const lambdasInvoked = contents.filter((c) =>
		c.Key?.startsWith(lambdaInitializedPrefix(renderId))
	);

	const timeToInvokeLambdas =
		startDate === null
			? null
			: max(lambdasInvoked.map((l) => l.LastModified?.getTime() as number)) -
			  startDate;
	return {
		timeToInvokeLambdas,
		lambdasInvoked: lambdasInvoked.length,
	};
};
