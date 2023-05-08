import {CliInternals} from '@remotion/cli';
import type {RenderMediaOnCloudrunOutput} from '../../../api/render-media-on-cloudrun';
import {renderMediaOnCloudrun} from '../../../api/render-media-on-cloudrun';
import type {CloudrunCodec} from '../../../shared/validate-gcp-codec';
// import {validateMaxRetries} from '../../../shared/validate-retries';
import {downloadFile} from '../../../api/download-file';
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
		codec,
		codecReason,
		inputProps,
		outputBucket,
		downloadName,
		privacy,
		authenticatedRequest,
	} = await renderArgsCheck(RENDER_MEDIA_SUBCOMMAND, args, remotionRoot);

	// Todo: Check cloudRunUrl is valid, as the error message is obtuse
	CliInternals.Log.info(
		CliInternals.chalk.gray(
			`
Sending request to Cloud Run:

    Cloud Run Service URL = ${cloudRunUrl}
    Authenticated Request = ${authenticatedRequest}
    Type = media
    Composition = ${composition}
    Codec = ${codec}
    Output Bucket = ${outputBucket}
    Output File = ${outName ?? 'out.mp4'}
		Output File Privacy = ${privacy}
			`.trim()
		)
	);
	Log.info();

	const renderStart = Date.now();
	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
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
			].join(' ')
		);
	};

	const updateRenderProgress = (progress: number) => {
		renderProgress.progress = progress;
		updateProgress();
	};

	const res = await renderMediaOnCloudrun({
		authenticatedRequest,
		cloudRunUrl,
		serveUrl,
		composition,
		inputProps,
		codec: codec as CloudrunCodec,
		outputBucket,
		privacy,
		outputFile: outName,
		updateRenderProgress,
	});
	renderProgress.doneIn = Date.now() - renderStart;
	updateProgress();

	const success = res as RenderMediaOnCloudrunOutput;
	Log.info(`
		
		`);
	Log.info(
		CliInternals.chalk.blueBright(
			`
🤘 Rendered media on Cloud Run! 🤘

    Public URL = ${success.publicUrl}
    Cloud Storage Uri = ${success.cloudStorageUri}
    Size (KB) = ${Math.round(Number(success.size) / 1000)}
    Bucket Name = ${success.bucketName}
		Privacy = ${success.privacy}
    Render ID = ${success.renderId}
    Codec = ${codec} (${codecReason})
      `.trim()
		)
	);

	if (downloadName) {
		Log.info('');
		Log.info('downloading file...');

		const destination = await downloadFile({
			bucketName: success.bucketName,
			gsutilURI: success.cloudStorageUri,
			downloadName,
		});

		Log.info(
			CliInternals.chalk.blueBright(`Downloaded file to ${destination}!`)
		);
	}
};
