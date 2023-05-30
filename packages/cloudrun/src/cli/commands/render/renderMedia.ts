import {CliInternals} from '@remotion/cli';
import {renderMediaOnCloudrun} from '../../../api/render-media-on-cloudrun';
import type {CloudrunCodec} from '../../../shared/validate-gcp-codec';
// import {validateMaxRetries} from '../../../shared/validate-retries';
import {ConfigInternals} from '@remotion/cli/config';
import {downloadFile} from '../../../api/download-file';
import {parsedCloudrunCli} from '../../args';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {renderArgsCheck} from './helpers/renderArgsCheck';

export const RENDER_MEDIA_SUBCOMMAND = 'media';

export const renderMediaSubcommand = async (
	args: string[],
	remotionRoot: string
) => {
	const {
		serveUrl,
		cloudRunUrl,
		composition,
		outName,
		forceBucketName,
		downloadName,
		privacy,
		region,
	} = await renderArgsCheck(RENDER_MEDIA_SUBCOMMAND, args);

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
	} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
		remotionRoot,
	});

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
			false
		);
	};

	const updateRenderProgress = (progress: number) => {
		renderProgress.progress = progress;
		updateProgress();
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
	});
	renderProgress.doneIn = Date.now() - renderStart;
	updateProgress();

	if (res.status === 'success') {
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
      `.trim()
			)
		);

		if (downloadName) {
			Log.info('');
			Log.info('downloading file...');

			const destination = await downloadFile({
				bucketName: res.bucketName,
				gsutilURI: res.cloudStorageUri,
				downloadName,
			});

			Log.info(
				CliInternals.chalk.blueBright(`Downloaded file to ${destination}!`)
			);
		}
	} else {
		Log.error('Render failed with the following error: ');
		Log.error(res.stack);
		quit(1);
	}
};
