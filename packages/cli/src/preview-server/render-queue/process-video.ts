import {convertEntryPointToServeUrl} from '../../convert-entry-point-to-serve-url';
import {getCliOptions} from '../../get-cli-options';
import {renderCompFlow} from '../../render-flows/render';
import type {JobProgressCallback, RenderJob} from './job';

export const processVideoJob = async ({
	job,
	remotionRoot,
	entryPoint,
	onProgress,
	addCleanupCallback,
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
	onProgress: JobProgressCallback;
	addCleanupCallback: (cb: () => Promise<void>) => void;
}) => {
	if (job.type !== 'video') {
		throw new Error('Expected video job');
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
	} = await getCliOptions({
		isLambda: false,
		type: 'still',
		remotionRoot,
	});

	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);

	await renderCompFlow({
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
		width: null,
		compositionIdFromUi: job.compositionId,
		configFileImageFormat: undefined,
		logLevel: job.verbose ? 'verbose' : 'info',
		onProgress,
		indent: true,
		// TODO: Make configurable
		concurrency: null,
		// TODO: Make configurable
		everyNthFrame: 1,
		// TODO: Make configurable
		frameRange: null,
		quiet: false,
		shouldOutputImageSequence: false,
		addCleanupCallback,
		outputLocationFromUI: job.outName,
		uiCodec: job.codec,
		uiImageFormat: job.imageFormat,
		cancelSignal: job.cancelToken.cancelSignal,
	});
	// TODO: Accept CLI options
};
