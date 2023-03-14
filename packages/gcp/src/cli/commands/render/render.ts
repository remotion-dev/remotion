import {CliInternals} from '@remotion/cli';
import {getCompositions} from '@remotion/renderer';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import type {
	RenderMediaOnGcpErrOutput,
	RenderMediaOnGcpOutput,
} from '../../../api/render-media-on-gcp';
import {renderMediaOnGcp} from '../../../api/render-media-on-gcp';
import {BINARY_NAME} from '../../../shared/constants';
import type {GcpCodec} from '../../../shared/validate-gcp-codec';
// import {validateMaxRetries} from '../../../shared/validate-retries';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedGcpCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const RENDER_COMMAND = 'render';

export const renderCommand = async (args: string[], remotionRoot: string) => {
	const serveUrl = args[0];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <cloud-run-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	const cloudRunUrl = args[1];
	if (!cloudRunUrl) {
		Log.error('No Cloud Run Service URL passed.');
		Log.info(
			'Pass an additional argument specifying the endpoint of your Cloud Run Service.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <cloud-run-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	let composition: string = args[2];
	if (!composition) {
		Log.info(
			`<serve-url> passed: ${serveUrl} 
<cloud-run-url> passed: ${cloudRunUrl}`
		);
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);
		const comps = await getCompositions(serveUrl);
		const {compositionId} = await CliInternals.selectComposition(comps);
		composition = compositionId;
	}

	const outName = parsedGcpCli['out-name'] ?? 'out.mp4'; // Todo, workout file extension instead of assuming mp4
	const downloadName = args[2] ?? null;

	const {codec} = CliInternals.getFinalCodec({
		downloadName,
		outName: outName ?? null,
	});

	const {inputProps} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true, // TODO: what do I need to do with this?
		remotionRoot,
	});
	// const maxRetries = parsedGcpCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	// validateMaxRetries(maxRetries);

	// const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	// validatePrivacy(privacy);

	let outputBucket = parsedGcpCli['output-bucket'];
	if (!outputBucket) {
		const {bucketName} = await getOrCreateBucket({
			region: getGcpRegion(),
		});
		outputBucket = bucketName;
	}

	// Todo: Check cloudRunUrl is valid, as the error message is obtuse
	CliInternals.Log.info(
		CliInternals.chalk.gray(
			`
Sending request to Cloud Run:

    Cloud Run Service URL = ${cloudRunUrl}
    Type = media
    Composition = ${composition}
    Codec = ${codec}
    Output Bucket = ${outputBucket}
    Output File = ${outName}
			`.trim()
		)
	);
	Log.info();

	const renderStart = Date.now();
	const progressBar = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);

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

	const res = await renderMediaOnGcp({
		cloudRunUrl,
		// serviceName,
		serveUrl,
		composition,
		inputProps,
		codec: codec as GcpCodec,
		outputBucket,
		outputFile: outName,
		updateRenderProgress,
	});

	renderProgress.doneIn = Date.now() - renderStart;
	updateProgress();

	if (res.status === 'error') {
		const err = res as RenderMediaOnGcpErrOutput;
		Log.error(CliInternals.chalk.red(err.message));
		throw err.error;
	} else {
		const success = res as RenderMediaOnGcpOutput;
		Log.info(`
		
		`);
		Log.info(
			CliInternals.chalk.blueBright(
				`
🤘 Rendered on Cloud Run! 🤘

    Public URL = ${success.publicUrl}
    Cloud Storage Uri = ${success.cloudStorageUri}
    Size (KB) = ${Math.round(Number(success.size) / 1000)}
    Bucket Name = ${success.bucketName}
    Render ID = ${success.renderId}
      `.trim()
			)
		);
	}
};
