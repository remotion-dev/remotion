import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {downloadFile} from '../../../api/download-file';
import {internalRenderMediaOnCloudrun} from '../../../api/render-media-on-cloudrun';
import type {CloudrunCodec} from '../../../shared/validate-gcp-codec';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedCloudrunCli} from '../../args';
import {displayCrashLogs} from '../../helpers/cloudrun-crash-logs';
import {Log} from '../../log';
import {renderArgsCheck} from './helpers/renderArgsCheck';

export const RENDER_COMMAND = 'render';

const {
	audioBitrateOption,
	x264Option,
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrateOption,
} = BrowserSafeApis.options;

export const renderCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const {
		serveUrl,
		cloudRunUrl,
		outName,
		forceBucketName,
		downloadName,
		privacy,
		region,
	} = await renderArgsCheck(RENDER_COMMAND, args, logLevel);

	const {codec, reason: codecReason} = CliInternals.getFinalOutputCodec({
		cliFlag: CliInternals.parsedCli.codec,
		downloadName,
		outName: outName ?? null,
		configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
		uiCodec: null,
		compositionCodec: null,
	});

	const imageFormat = parsedCloudrunCli['image-format'];

	const audioCodec = parsedCloudrunCli['audio-codec'];

	const {
		chromiumOptions,
		envVariables,
		frameRange,
		inputProps,
		puppeteerTimeout,
		pixelFormat,
		proResProfile,
		everyNthFrame,
		numberOfGifLoops,
		muted,
		encodingMaxRate,
		encodingBufferSize,
		height,
		width,
		browserExecutable,
		enforceAudioTrack,
		colorSpace,
	} = CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
		remotionRoot,
		logLevel,
	});

	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: CliInternals.parsedCli,
		}).value;
	let composition: string = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);

		if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
			throw Error(
				'Passing the shorthand serve URL without composition name is currently not supported.\n Make sure to pass a composition name after the shorthand serve URL or pass the complete serveURL without composition name to get to choose between all compositions.',
			);
		}

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
				browserExecutable,
				chromiumOptions,
				envVariables,
				height,
				indent: false,
				port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
				puppeteerInstance: undefined,
				serveUrlOrWebpackUrl: serveUrl,
				timeoutInMilliseconds: puppeteerTimeout,
				logLevel,
				width,
				server: await server,
				serializedInputPropsWithCustomSchema:
					NoReactInternals.serializeJSONWithDate({
						data: inputProps,
						indent: undefined,
						staticBase: null,
					}).serializedString,
				offthreadVideoCacheSizeInBytes,
			});
		composition = compositionId;
	}

	// Todo: Check cloudRunUrl is valid, as the error message is obtuse
	CliInternals.Log.info(
		CliInternals.chalk.gray(
			`
Cloud Run Service URL = ${cloudRunUrl}
Region = ${region}
Type = media
Composition = ${composition}
Codec = ${codec}
Output Bucket = ${forceBucketName}
Output File = ${outName ?? 'out.mp4'}
Output File Privacy = ${privacy}
${downloadName ? `		Downloaded File = ${downloadName}` : ''}
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

	const renderProgress: {
		progress: number;
		doneIn: number | null;
	} = {
		doneIn: null,
		progress: 0,
	};
	const updateProgress = () => {
		progressBar.update(
			[
				`Rendering on Cloud Run: `,
				CliInternals.makeProgressBar(renderProgress.progress),
				`${renderProgress.doneIn === null ? 'Rendering' : 'Rendered'}`,
				renderProgress.doneIn === null
					? `${Math.round(renderProgress.progress * 100)}%`
					: CliInternals.chalk.gray(`${renderProgress.doneIn}ms`),
			].join(' '),
			false,
		);
	};

	const updateRenderProgress = (progress: number, error?: boolean) => {
		if (error) {
			// exiting progress and adding space
			Log.info(`
		
		`);
		} else {
			renderProgress.progress = progress;
			updateProgress();
		}
	};

	const x264Preset = x264Option.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const scale = scaleOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const crf = crfOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const res = await internalRenderMediaOnCloudrun({
		cloudRunUrl,
		serviceName: undefined,
		region,
		serveUrl,
		composition,
		inputProps,
		codec: codec as CloudrunCodec,
		forceBucketName,
		privacy,
		outName,
		updateRenderProgress,
		jpegQuality,
		audioCodec,
		audioBitrate,
		videoBitrate,
		encodingMaxRate,
		encodingBufferSize,
		proResProfile,
		x264Preset,
		crf,
		pixelFormat,
		imageFormat,
		scale,
		everyNthFrame,
		numberOfGifLoops,
		frameRange: frameRange ?? undefined,
		envVariables,
		chromiumOptions,
		muted,
		forceWidth: width,
		forceHeight: height,
		logLevel: ConfigInternals.Logging.getLogLevel(),
		delayRenderTimeoutInMilliseconds: puppeteerTimeout,
		// Special case: Should not use default local concurrency, or from
		// config file, just when explicitly set
		concurrency: CliInternals.parsedCli.concurrency ?? null,
		enforceAudioTrack,
		preferLossless: false,
		offthreadVideoCacheSizeInBytes,
		colorSpace,
	});

	if (res.type === 'crash') {
		displayCrashLogs(res);
	} else if (res.type === 'success') {
		renderProgress.doneIn = Date.now() - renderStart;
		updateProgress();
		Log.info(`
		
		`);
		Log.info(
			CliInternals.chalk.blueBright(
				`
${res.publicUrl ? `Public URL = ${decodeURIComponent(res.publicUrl)}` : ``}
Cloud Storage Uri = ${res.cloudStorageUri}
Size (KB) = ${Math.round(Number(res.size) / 1000)}
Bucket Name = ${res.bucketName}
Privacy = ${res.privacy}
Render ID = ${res.renderId}
Codec = ${codec} (${codecReason})
      `.trim(),
			),
		);

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
