import {CliInternals} from '@remotion/cli';
import {getDeployedLambdas} from '../api/get-deployed-lambdas';
import {getRenderProgress} from '../api/get-render-progress';
import {renderVideoOnLambda} from '../api/render-video-on-lambda';
import {BINARY_NAME} from '../shared/constants';
import {sleep} from '../shared/sleep';
import {parsedLambdaCli} from './args';
import {CLEANUP_COMMAND, CLEANUP_LAMBDAS_SUBCOMMAND} from './cleanup';
import {DEPLOY_COMMAND} from './deploy';
import {getAwsRegion} from './get-aws-region';
import {Log} from './log';

export const RENDER_COMMAND = 'render';

export const renderCommand = async () => {
	const serveUrl = parsedLambdaCli._[1];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <http://remotion.s3.amazonaws.com>`
		);
		process.exit(1);
	}

	// TODO: Redundancy with CLI
	if (!parsedLambdaCli._[2]) {
		Log.error('Composition ID not passed.');
		Log.error('Pass an extra argument <composition-id>.');
		process.exit(1);
	}

	// TODO: Further validate serveUrl

	const remotionLambdas = await getDeployedLambdas({region: getAwsRegion()});

	if (remotionLambdas.length === 0) {
		Log.error('No lambda functions found in your account.');
		Log.info('Run');
		Log.info(`  npx ${BINARY_NAME} ${DEPLOY_COMMAND}`);
		Log.info(`to deploy a lambda function.`);
		process.exit(1);
	}

	if (remotionLambdas.length > 1) {
		Log.error(
			'More than lambda function found in your account. This is an error'
		);
		Log.info(`Delete extraneous lambda functions in your AWS console or run`);
		Log.info(
			`  npx ${BINARY_NAME} ${CLEANUP_COMMAND} ${CLEANUP_LAMBDAS_SUBCOMMAND}`
		);
		Log.info('to delete all lambda functions.');
		process.exit(1);
	}

	const functionName = remotionLambdas[0].FunctionName as string;

	const cliOptions = await CliInternals.getCliOptions({isLambda: true});

	const res = await renderVideoOnLambda({
		functionName,
		serveUrl,
		inputProps: cliOptions.inputProps,
		codec: cliOptions.codec,
		imageFormat: cliOptions.imageFormat,
		crf: cliOptions.crf ?? undefined,
		envVariables: cliOptions.envVariables,
		pixelFormat: cliOptions.pixelFormat,
		proResProfile: cliOptions.proResProfile,
		quality: cliOptions.quality,
		region: getAwsRegion(),
		// TODO: Unhardcode retries
		maxRetries: 3,
	});
	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const status = await getRenderProgress({
			functionName,
			bucketName: res.bucketName,
			renderId: res.renderId,
			region: getAwsRegion(),
		});
		Log.info(status);
		if (status.done) {
			Log.info('Done! ' + res.bucketName);
			process.exit(0);
		}
	}
};
