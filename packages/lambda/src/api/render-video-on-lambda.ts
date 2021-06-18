import {parsedCli} from '../cli/args';
import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

export const renderVideoOnLambda = async ({
	functionName,
	serveUrl,
	inputProps,
}: {
	functionName: string;
	serveUrl: string;
	inputProps: unknown;
}) => {
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			// TODO: Allow to parametrize
			chunkSize: 20,
			composition: parsedCli._[2],
			serveUrl,
			inputProps,
		},
	});
	return {
		renderId: res.renderId,
		bucketName: res.bucketName,
	};
};
