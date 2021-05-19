import {ListFunctionsCommand} from '@aws-sdk/client-lambda';
import {lambdaClient} from '../aws-clients';
import {BINARY_NAME} from '../bundle-remotion';
import {callLambda} from '../call-lambda';
import {checkLambdaStatus} from '../check-lambda-status';
import {LambdaRoutines, RENDER_FN_PREFIX} from '../constants';
import {sleep} from '../sleep';
import {parsedCli} from './args';
import {Log} from './log';

export const RENDER_COMMAND = 'render';

export const renderCommand = async () => {
	const serveUrl = parsedCli._[1];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(`${BINARY_NAME} render <http://remotion.s3.amazonaws.com>`);
		process.exit(1);
	}

	// TODO: Redundancy with CLI
	if (!parsedCli._[2]) {
		Log.error('Composition ID not passed.');
		Log.error('Pass an extra argument <composition-id>.');
		process.exit(1);
	}

	// TODO: Further validate serveUrl

	const lambdas = await lambdaClient.send(new ListFunctionsCommand({}));

	const remotionLambdas = (lambdas.Functions || []).filter((f) => {
		return f.FunctionName?.startsWith(RENDER_FN_PREFIX);
	});

	if (remotionLambdas.length === 0) {
		Log.error('No lambda functions found in your account.');
		process.exit(1);
	}

	if (remotionLambdas.length > 1) {
		Log.error(
			'More than lambda function found in your account. Not sure what to do.'
		);
		process.exit(1);
	}

	const functionName = remotionLambdas[0].FunctionName as string;

	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			// TODO: Allow to parametrize
			chunkSize: 20,
			composition: parsedCli._[2],
			serveUrl,
			// TODO: Allow to parametrize
			inputProps: {},
		},
	});
	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const status = await checkLambdaStatus(functionName, res.bucketName);
		console.log(status);
		if (status.done) {
			console.log('Done! ' + res.bucketName);
			process.exit(0);
		}
	}
};
