import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import {RenderInternals} from '@remotion/renderer';
import {Internals} from 'remotion';
import {downloadFile} from '../../api/download-file';
import {extractMemoryFromURL} from '../../api/helpers/extract-mem-from-url';
import {extractTimeoutFromURL} from '../../api/helpers/extract-time-from-url';
import {getCloudLoggingClient} from '../../api/helpers/get-cloud-logging-client';
import {renderStillOnCloudrun} from '../../api/render-still-on-cloudrun';
import {validateServeUrl} from '../../shared/validate-serveurl';
import {Log} from '../log';
import {renderArgsCheck} from './render/helpers/renderArgsCheck';

export const STILL_COMMAND = 'still';

export const stillCommand = async (args: string[], remotionRoot: string) => {
	const {
		serveUrl,
		cloudRunUrl,
		outName,
		forceBucketName,
		privacy,
		downloadName,
		region,
	} = await renderArgsCheck(STILL_COMMAND, args);

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
		port,
		logLevel,
	} = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
		remotionRoot,
	});

	let composition = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);

		if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
			throw Error(
				'Passing the shorthand serve URL without composition name is currently not supported.\n Make sure to pass a composition name after the shorthand serve URL or pass the complete serveURL without composition name to get to choose between all compositions.'
			);
		}

		const server = RenderInternals.prepareServer({
			concurrency: 1,
			indent: false,
			port,
			remotionRoot,
			logLevel,
			webpackConfigOrServeUrl: serveUrl,
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
				serializedInputPropsWithCustomSchema: Internals.serializeJSONWithDate({
					data: inputProps,
					indent: undefined,
					staticBase: null,
				}).serializedString,
				port,
				puppeteerInstance: undefined,
				timeoutInMilliseconds: puppeteerTimeout,
				height,
				width,
				server: await server,
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
	Log.verbose(`Image format: (${imageFormat}), ${imageFormatReason}`);
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
			`.trim()
		)
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
			newline
		);
	};

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
		logLevel: ConfigInternals.Logging.getLogLevel(),
		delayRenderTimeoutInMilliseconds: puppeteerTimeout,
	});
	if (res.type === 'crash') {
		let timeoutPreMsg = '';

		const timeout = extractTimeoutFromURL(res.cloudRunEndpoint);
		const memoryLimit = extractMemoryFromURL(res.cloudRunEndpoint);

		if (timeout && res.requestElapsedTimeInSeconds + 10 > timeout) {
			timeoutPreMsg = `Render call likely timed out. Service timeout is ${timeout} seconds, and render took at least ${res.requestElapsedTimeInSeconds.toFixed(
				1
			)} seconds.\n`;
		} else {
			timeoutPreMsg = `Crash unlikely due to timeout. Render took ${res.requestElapsedTimeInSeconds.toFixed(
				1
			)} seconds, below the timeout of ${timeout} seconds.\n`;
		}

		Log.error(
			`Error rendering on Cloud Run. The Cloud Run service did not return a response.\n
${timeoutPreMsg}The crash may be due to the service exceeding its memory limit of ${memoryLimit}.
Full logs are available at https://console.cloud.google.com/run?project=${process.env.REMOTION_GCP_PROJECT_ID}\n`
		);

		const cloudLoggingClient = getCloudLoggingClient();

		const listLogEntriesRequest = {
			resourceNames: [`projects/${process.env.REMOTION_GCP_PROJECT_ID}`],
			filter: `logName=projects/${process.env.REMOTION_GCP_PROJECT_ID}/logs/run.googleapis.com%2Fvarlog%2Fsystem AND (severity=WARNING OR severity=ERROR) AND timestamp >= "${res.requestStartTime}"`,
		};

		const logCheckCountdown = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
			updatesDontOverwrite: false,
			indent: false,
		});

		await (() => {
			return new Promise<void>((resolve) => {
				let timeLeft = 30;
				const intervalId = setInterval(() => {
					logCheckCountdown.update(
						`GCP Cloud Logging takes time to ingest and index logs.\nFetching recent error/warning logs in ${timeLeft} seconds`,
						false
					);
					timeLeft--;
					if (timeLeft < 0) {
						logCheckCountdown.update('Fetching logs...\n\n', false);
						clearInterval(intervalId);
						resolve();
					}
				}, 1000);
			});
		})();

		const iterableLogListEntries = await cloudLoggingClient.listLogEntriesAsync(
			listLogEntriesRequest
		);
		for await (const logResponse of iterableLogListEntries) {
			const responseDate = new Date(
				Number(logResponse.timestamp.seconds) * 1000 +
					Number(logResponse.timestamp.nanos) / 1000000
			);

			const convertedDate = responseDate.toLocaleString();

			Log.info(convertedDate);
			Log.info(logResponse.textPayload);
			Log.info();
		}
	} else if (res.type === 'success') {
		doneIn = Date.now() - renderStart;
		updateProgress(true);

		Log.info(
			CliInternals.chalk.gray(`Cloud Storage Uri = ${res.cloudStorageUri}`)
		);
		Log.info(CliInternals.chalk.gray(`Render ID = ${res.renderId}`));
		Log.info(
			CliInternals.chalk.gray(
				`${Math.round(Number(res.size) / 1000)} KB, Privacy: ${
					res.privacy
				}, Bucket: ${res.bucketName}`
			)
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
				CliInternals.chalk.blueBright(`Downloaded file to ${destination}!`)
			);
		}
	}
};
