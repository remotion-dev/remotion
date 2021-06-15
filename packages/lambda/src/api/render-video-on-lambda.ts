import {CliInternals} from '@remotion/cli';
import {parsedCli} from '../cli/args';
import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

export const renderVideoOnLambda = async ({
	functionName,
	serveUrl,
}: {
	functionName: string;
	serveUrl: string;
}) => {
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			// TODO: Allow to parametrize
			chunkSize: 20,
			composition: parsedCli._[2],
			serveUrl,
			inputProps: CliInternals.getInputProps(),
		},
	});
	return {
		renderId: res.renderId,
		bucketName: res.bucketName,
	};
};
