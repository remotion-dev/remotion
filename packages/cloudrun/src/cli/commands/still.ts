import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {downloadFile} from '../../api/download-file';
import {renderStillOnCloudrun} from '../../api/render-still-on-cloudrun';
import {validateServeUrl} from '../../shared/validate-serveurl';
import {displayCrashLogs} from '../helpers/cloudrun-crash-logs';
import {Log} from '../log';
import {renderArgsCheck} from './render/helpers/renderArgsCheck';

export const STILL_COMMAND = 'still';

const {
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	jpegQualityOption,
	enableMultiprocessOnLinuxOption,
	glOption,
} = BrowserSafeApis.options;

export const stillCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const {
		serveUrl,
		cloudRunUrl,
		outName,
		forceBucketName,
		privacy,
		downloadName,
		region,
	} = await renderArgsCheck(STILL_COMMAND, args, logLevel);

	const {
		envVariables,
		inputProps,
		puppeteerTimeout,
		stillFrame,
		height,
		width,
		browserExecutable,
		headless,
		userAgent,
		disableWebSecurity,
		ignoreCertificateErrors,
	} = CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
		remotionRoot,
		logLevel,
	});

	let composition = args[1];

	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: CliInternals.parsedCli}).value;
	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		headless,
		ignoreCertificateErrors,
		userAgent,
	};

	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);

		if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
			throw Error(
				'Passing the shorthand serve URL without composition name is currently not supported.\n Make sure to pass a composition name after the shorthand serve URL or pass the complete serveURL without composition name to get to choose between all compositions.',
			);
		}

		const offthreadVideoCacheSizeInBytes =
			offthreadVideoCacheSizeInBytesOption.getValue({
				commandLine: CliInternals.parsedCli,
			}).value;

		const server = RenderInternals.prepareServer({
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
						data: inputProps,
						indent: undefined,
						staticBase: null,
					}).serializedString,
				port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
				puppeteerInstance: undefined,
				timeoutInMilliseconds: puppeteerTimeout,
				height,
				width,
				server: await server,
				offthreadVideoCacheSizeInBytes,
			});
		composition = compositionId;
	}

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
	Log.verbose(
		{indent: false, logLevel},
		`Image format: (${imageFormat}), ${imageFormatReason}`,
	);
	// Todo: Check cloudRunUrl is valid, as the error message is obtuse
	CliInternals.Log.info(
		CliInternals.chalk.gray(
			`
Cloud Run Service URL = ${cloudRunUrl}
Region = ${region}
Type = still
Composition = ${composition}
Output Bucket = ${forceBucketName}
Output File = ${outName ?? 'out.png'}
Output File Privacy = ${privacy}
${downloadName ? `    Downloaded File = ${downloadName}` : ''}
			`.trim(),
		),
	);
	Log.info();

	const renderStart = Date.now();
	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		updatesDontOverwrite: false,
		indent: false,
	});

	type DoneIn = number | null;

	let doneIn: DoneIn = null;

	const updateProgress = (newline: boolean) => {
		progressBar.update(
			[
				`Rendering on Cloud Run:`,
				`${doneIn === null ? '...' : `Rendered in ${doneIn}ms`}`,
			].join(' '),
			newline,
		);
	};

	const scale = scaleOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;

	const res = await renderStillOnCloudrun({
		cloudRunUrl,
		serveUrl,
		region,
		inputProps,
		imageFormat,
		composition,
		privacy,
		envVariables,
		frame: stillFrame,
		jpegQuality,
		chromiumOptions,
		scale,
		forceHeight: height,
		forceWidth: width,
		forceBucketName,
		outName,
		logLevel,
		delayRenderTimeoutInMilliseconds: puppeteerTimeout,
	});
	if (res.type === 'crash') {
		displayCrashLogs(res);
	} else if (res.type === 'success') {
		doneIn = Date.now() - renderStart;
		updateProgress(true);

		Log.info(
			CliInternals.chalk.gray(`Cloud Storage Uri = ${res.cloudStorageUri}`),
		);
		Log.info(CliInternals.chalk.gray(`Render ID = ${res.renderId}`));
		Log.info(
			CliInternals.chalk.gray(
				`${Math.round(Number(res.size) / 1000)} KB, Privacy: ${
					res.privacy
				}, Bucket: ${res.bucketName}`,
			),
		);
		Log.info(CliInternals.chalk.blue(`○ ${res.publicUrl}`));

		if (downloadName) {
			Log.info('');
			Log.info('downloading file...');

			const {outputPath: destination} = await downloadFile({
				bucketName: res.bucketName,
				gsutilURI: res.cloudStorageUri,
				downloadName,
			});

			Log.info(
				CliInternals.chalk.blueBright(`Downloaded file to ${destination}!`),
			);
		}
	}
};
