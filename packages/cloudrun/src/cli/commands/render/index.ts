import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import {RenderInternals} from '@remotion/renderer';
import {Internals} from 'remotion';
import {downloadFile} from '../../../api/download-file';
import {renderMediaOnCloudrun} from '../../../api/render-media-on-cloudrun';
import type {CloudrunCodec} from '../../../shared/validate-gcp-codec';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedCloudrunCli} from '../../args';
import {displayCrashLogs} from '../../helpers/cloudrun-crash-logs';
import {Log} from '../../log';
import {renderArgsCheck} from './helpers/renderArgsCheck';

export const RENDER_COMMAND = 'render';

export const renderCommand = async (args: string[], remotionRoot: string) => {
	const {
		serveUrl,
		cloudRunUrl,
		outName,
		forceBucketName,
		downloadName,
		privacy,
		region,
	} = await renderArgsCheck(RENDER_COMMAND, args);

	const {codec, reason: codecReason} = CliInternals.getFinalOutputCodec({
		cliFlag: CliInternals.parsedCli.codec,
		downloadName,
		outName: outName ?? null,
		configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
		uiCodec: null,
	});

	const imageFormat = parsedCloudrunCli['image-format'];

	const audioCodec = parsedCloudrunCli['audio-codec'];

	const {
		chromiumOptions,
		crf,
		envVariables,
		frameRange,
		inputProps,
		logLevel,
		puppeteerTimeout,
		pixelFormat,
		proResProfile,
		jpegQuality,
		scale,
		everyNthFrame,
		numberOfGifLoops,
		muted,
		audioBitrate,
		videoBitrate,
		height,
		width,
		browserExecutable,
		port,
		enforceAudioTrack,
		offthreadVideoCacheSizeInBytes,
	} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
		remotionRoot,
	});

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
			port,
			remotionRoot,
			logLevel,
			webpackConfigOrServeUrl: serveUrl,
			offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
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
				port,
				puppeteerInstance: undefined,
				serveUrlOrWebpackUrl: serveUrl,
				timeoutInMilliseconds: puppeteerTimeout,
				logLevel,
				width,
				server: await server,
				serializedInputPropsWithCustomSchema: Internals.serializeJSONWithDate({
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

	const res = await renderMediaOnCloudrun({
		cloudRunUrl,
		serveUrl,
		region,
		inputProps,
		codec: codec as CloudrunCodec,
		imageFormat,
		crf: crf ?? undefined,
		envVariables,
		pixelFormat,
		proResProfile,
		jpegQuality,
		composition,
		privacy,
		frameRange: frameRange ?? undefined,
		outName,
		chromiumOptions,
		scale,
		numberOfGifLoops,
		everyNthFrame,
		muted,
		audioBitrate,
		videoBitrate,
		forceHeight: height,
		forceWidth: width,
		audioCodec,
		forceBucketName,
		updateRenderProgress,
		logLevel: ConfigInternals.Logging.getLogLevel(),
		// Special case: Should not use default local concurrency, or from
		// config file, just when explicitly set
		concurrency: CliInternals.parsedCli.concurrency ?? null,
		delayRenderTimeoutInMilliseconds: puppeteerTimeout,
		enforceAudioTrack,
		preferLossless: false,
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
