import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import {RenderInternals} from '@remotion/renderer';
import {downloadMedia} from '../../api/download-media';
import {renderStillOnLambda} from '../../api/render-still-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../shared/constants';
import {validatePrivacy} from '../../shared/validate-privacy';
import {validateMaxRetries} from '../../shared/validate-retries';
import {validateServeUrl} from '../../shared/validate-serveurl';
import {parsedLambdaCli} from '../args';
import {getAwsRegion} from '../get-aws-region';
import {findFunctionName} from '../helpers/find-function-name';
import {quit} from '../helpers/quit';
import {Log} from '../log';

export const STILL_COMMAND = 'still';

export const stillCommand = async (args: string[], remotionRoot: string) => {
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

	const {
		chromiumOptions,
		envVariables,
		inputProps,
		logLevel,
		puppeteerTimeout,
		jpegQuality,
		stillFrame,
		scale,
		height,
		width,
		browserExecutable,
		port,
	} = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
		remotionRoot,
	});

	const region = getAwsRegion();
	let composition = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);
		const server = RenderInternals.prepareServer({
			concurrency: 1,
			indent: false,
			port,
			remotionRoot,
			verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
			webpackConfigOrServeUrl: serveUrl,
		});

		const {compositionId} =
			await CliInternals.getCompositionWithDimensionOverride({
				args,
				compositionIdFromUi: null,
				indent: false,
				serveUrlOrWebpackUrl: serveUrl,
				verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
				browserExecutable,
				chromiumOptions,
				envVariables,
				inputProps,
				port,
				puppeteerInstance: undefined,
				timeoutInMilliseconds: puppeteerTimeout,
				height,
				width,
				server: await server,
			});
		composition = compositionId;
	}

	const downloadName = args[2] ?? null;
	const outName = parsedLambdaCli['out-name'];

	const functionName = await findFunctionName();

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy, true);

	const {format: imageFormat, source: imageFormatReason} =
		CliInternals.determineFinalStillImageFormat({
			downloadName,
			outName: outName ?? null,
			cliFlag: CliInternals.parsedCli['image-format'] ?? null,
			isLambda: true,
			fromUi: null,
			configImageFormat:
				ConfigInternals.getUserPreferredStillImageFormat() ?? null,
		});

	try {
		Log.info(
			CliInternals.chalk.gray(
				`functionName = ${functionName}, imageFormat = ${imageFormat} (${imageFormatReason})`
			)
		);

		const res = await renderStillOnLambda({
			functionName,
			serveUrl,
			inputProps,
			imageFormat,
			composition,
			privacy,
			region,
			maxRetries,
			envVariables,
			frame: stillFrame,
			jpegQuality,
			logLevel,
			outName,
			chromiumOptions,
			timeoutInMilliseconds: puppeteerTimeout,
			scale,
			forceHeight: height,
			forceWidth: width,
		});
		Log.info(
			CliInternals.chalk.gray(
				`Bucket = ${res.bucketName}, renderId = ${res.renderId}`
			)
		);
		Log.verbose(`CloudWatch logs (if enabled): ${res.cloudWatchLogs}`);

		if (downloadName) {
			Log.info('Finished rendering. Downloading...');
			const {outputPath, sizeInBytes} = await downloadMedia({
				bucketName: res.bucketName,
				outPath: downloadName,
				region,
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
		await CliInternals.handleCommonError(
			errorWithStackFrame,
			RenderInternals.getLogLevel()
		);
		quit(1);
	}
};
