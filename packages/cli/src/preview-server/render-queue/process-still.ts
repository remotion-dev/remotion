import {convertEntryPointToServeUrl} from '../../convert-entry-point-to-serve-url';
import {getCliOptions} from '../../get-cli-options';
import {renderStillFlow} from '../../render-flows/still';
import type {JobProgressCallback, RenderJob} from './job';

export const processStill = async ({
	job,
	remotionRoot,
	entryPoint,
	onProgress,
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
	onProgress: JobProgressCallback;
}) => {
	if (job.type !== 'still') {
		throw new Error('Expected still job');
	}

	const {
		publicDir,
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		port,
		browser,
		puppeteerTimeout,
		logLevel,
		configFileImageFormat,
	} = await getCliOptions({
		isLambda: false,
		type: 'still',
		remotionRoot,
	});

	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);

	await renderStillFlow({
		remotionRoot,
		browser,
		browserExecutable,
		chromiumOptions,
		entryPointReason: 'same as preview',
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		height: null,
		fullEntryPoint,
		inputProps,
		overwrite: true,
		port,
		publicDir,
		puppeteerTimeout,
		quality: job.quality ?? undefined,
		remainingArgs: [],
		scale: job.scale,
		stillFrame: job.frame,
		width: null,
		compositionIdFromUi: job.compositionId,
		imageFormatFromUi: job.imageFormat,
		configFileImageFormat,
		logLevel,
		onProgress,
	});
	// TODO: Allow cancel signal
	// TODO: Accept CLI options
};
