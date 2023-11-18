import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
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

export const stillCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const serveUrl = args[0];

	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.',
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id>  [output-location]`,
		);
		quit(1);
	}

	const {
		chromiumOptions,
		envVariables,
		inputProps,
		puppeteerTimeout,
		jpegQuality,
		stillFrame,
		scale,
		height,
		width,
		browserExecutable,
		offthreadVideoCacheSizeInBytes,
	} = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
		remotionRoot,
		logLevel,
	});

	const region = getAwsRegion();
	let composition = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);

		if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
			throw Error(
				'Passing the shorthand serve URL without composition name is currently not supported.\n Make sure to pass a composition name after the shorthand serve URL or pass the complete serveURL without composition name to get to choose between all compositions.',
			);
		}

		const server = await RenderInternals.prepareServer({
			concurrency: 1,
			indent: false,
			port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
			remotionRoot,
			logLevel,
			webpackConfigOrServeUrl: serveUrl,
			offthreadVideoCacheSizeInBytes,
		});

		const {compositionId} =
			await CliInternals.getCompositionWithDimensionOverride({
				args: args.slice(1),
				compositionIdFromUi: null,
				indent: false,
				serveUrlOrWebpackUrl: serveUrl,
				logLevel,
				browserExecutable,
				chromiumOptions,
				envVariables,
				serializedInputPropsWithCustomSchema:
					NoReactInternals.serializeJSONWithDate({
						indent: undefined,
						staticBase: null,
						data: inputProps,
					}).serializedString,
				port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
				puppeteerInstance: undefined,
				timeoutInMilliseconds: puppeteerTimeout,
				height,
				width,
				server,
				offthreadVideoCacheSizeInBytes,
			});
		composition = compositionId;
	}

	const downloadName = args[2] ?? null;
	const outName = parsedLambdaCli['out-name'];

	const functionName = await findFunctionName(logLevel);

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

	Log.info(
		CliInternals.chalk.gray(
			`functionName = ${functionName}, imageFormat = ${imageFormat} (${imageFormatReason})`,
		),
	);

	const deleteAfter =
		parsedLambdaCli[BrowserSafeApis.options.deleteAfterOption.cliFlag];

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
		onInit: ({cloudWatchLogs, renderId, lambdaInsightsUrl}) => {
			Log.info(CliInternals.chalk.gray(`Render invoked with ID = ${renderId}`));
			Log.verbose(
				{indent: false, logLevel},
				`CloudWatch logs (if enabled): ${cloudWatchLogs}`,
			);
			Log.verbose(
				{indent: false, logLevel},
				`Lambda Insights (if enabled): ${lambdaInsightsUrl}`,
			);
		},
		deleteAfter,
	});

	if (downloadName) {
		Log.info('Finished rendering. Downloading...');
		const {outputPath, sizeInBytes} = await downloadMedia({
			bucketName: res.bucketName,
			outPath: downloadName,
			region,
			renderId: res.renderId,
			logLevel,
		});
		Log.info('Done!', outputPath, CliInternals.formatBytes(sizeInBytes));
	} else {
		Log.info(`Finished still!`);
		Log.info();
		Log.info(res.url);
	}
};
