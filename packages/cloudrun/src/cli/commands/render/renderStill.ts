import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import {downloadFile} from '../../../api/download-file';
import {renderStillOnCloudrun} from '../../../api/render-still-on-cloudrun';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {renderArgsCheck} from './helpers/renderArgsCheck';

export const RENDER_STILL_SUBCOMMAND = 'still';

export const renderStillSubcommand = async (
	args: string[],
	remotionRoot: string
) => {
	const {
		serveUrl,
		cloudRunUrl,
		composition,
		outName,
		outputBucket,
		privacy,
		downloadName,
	} = await renderArgsCheck(RENDER_STILL_SUBCOMMAND, args);

	const {
		chromiumOptions,
		envVariables,
		inputProps,
		jpegQuality,
		stillFrame,
		scale,
		height,
		width,
	} = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
		remotionRoot,
	});

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
Type = still
Composition = ${composition}
Output Bucket = ${outputBucket}
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
		outputBucket,
		outputFile: outName,
		logLevel: ConfigInternals.Logging.getLogLevel(),
	});
	doneIn = Date.now() - renderStart;
	updateProgress(true);

	if (res.status === 'success') {
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
		Log.error('Render failed with the following reason:');
		Log.error(res.stack);
		quit(1);
	}
};
