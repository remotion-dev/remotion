import {CliInternals} from '@remotion/cli';
import {RenderInternals} from '@remotion/renderer';
import type {StillImageFormat} from 'remotion';
import {downloadMedia} from '../../api/download-media';
import {renderStillOnLambda} from '../../api/render-still-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
	LambdaRoutines,
} from '../../shared/constants';
import {validatePrivacy} from '../../shared/validate-privacy';
import {validateMaxRetries} from '../../shared/validate-retries';
import {parsedLambdaCli} from '../args';
import {getAwsRegion} from '../get-aws-region';
import {findFunctionName} from '../helpers/find-function-name';
import {getCloudwatchStreamUrl} from '../helpers/get-cloudwatch-stream-url';
import {quit} from '../helpers/quit';
import {Log} from '../log';

export const STILL_COMMAND = 'still';

export const stillCommand = async (args: string[]) => {
	const serveUrl = args[0];

	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id>  [output-location]`
		);
		quit(1);
	}

	const composition = args[1];
	if (!composition) {
		Log.error('No composition ID passed.');
		Log.info('Pass an additional argument specifying the composition ID.');
		Log.info();
		Log.info(
			`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	const outName = args[2] ?? null;

	const {
		chromiumOptions,
		envVariables,
		imageFormat,
		inputProps,
		logLevel,
		puppeteerTimeout,
		quality,
		stillFrame,
		scale,
	} = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
	});

	const functionName = await findFunctionName();

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy);

	try {
		const res = await renderStillOnLambda({
			functionName,
			serveUrl,
			inputProps,
			imageFormat: imageFormat as StillImageFormat,
			composition,
			privacy,
			region: getAwsRegion(),
			maxRetries,
			envVariables,
			frame: stillFrame,
			quality,
			logLevel,
			outName: parsedLambdaCli['out-name'],
			chromiumOptions,
			timeoutInMilliseconds: puppeteerTimeout,
			scale,
		});
		Log.verbose(
			CliInternals.chalk.gray(
				`Bucket = ${res.bucketName}, renderId = ${res.renderId}, functionName = ${functionName}`
			)
		);
		Log.verbose(
			`CloudWatch logs (if enabled): ${getCloudwatchStreamUrl({
				functionName,
				region: getAwsRegion(),
				renderId: res.renderId,
				method: LambdaRoutines.still,
			})}`
		);

		if (outName) {
			Log.info('Finished rendering. Downloading...');
			const {outputPath, sizeInBytes} = await downloadMedia({
				bucketName: res.bucketName,
				outPath: outName,
				region: getAwsRegion(),
				renderId: res.renderId,
			});
			Log.info('Done!', outputPath, CliInternals.formatBytes(sizeInBytes));
		} else {
			Log.info(`Finished still!`);
			Log.info();
			Log.info(res.url);
		}
	} catch (err) {
		const frames = RenderInternals.parseStack(
			((err as Error).stack ?? '').split('\n')
		);

		const errorWithStackFrame = new RenderInternals.SymbolicateableError({
			message: (err as Error).message,
			frame: null,
			name: (err as Error).name,
			stack: (err as Error).stack,
			stackFrame: frames,
		});
		await CliInternals.handleCommonError(errorWithStackFrame);
		quit(1);
	}
};
