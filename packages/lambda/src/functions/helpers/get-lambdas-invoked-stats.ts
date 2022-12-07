import type {_Object} from '@aws-sdk/client-s3';
import {lambdaChunkInitializedPrefix} from '../../shared/constants';
import {parseLambdaInitializedKey} from '../../shared/parse-lambda-initialized-key';

export type LambdaInvokeStats = {
	lambdasInvoked: number;
};

export const getLambdasInvokedStats = ({
	contents,
	renderId,
}: {
	contents: _Object[];
	renderId: string;
}): LambdaInvokeStats => {
	const lambdasInvoked = contents
		.filter((c) => c.Key?.startsWith(lambdaChunkInitializedPrefix(renderId)))
		.filter((c) => parseLambdaInitializedKey(c.Key as string).attempt === 1);

	return {
		lambdasInvoked: lambdasInvoked.length,
	};
};
