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

	// TODO: Change until none can be derived from UI
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
		ffmpegOverride,
		audioBitrate,
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
		concurrency: job.concurrency,
		// TODO: Make configurable
		everyNthFrame: 1,
		frameRange: [job.startFrame, job.endFrame],
		quiet: false,
		shouldOutputImageSequence: false,
		addCleanupCallback,
		outputLocationFromUI: job.outName,
		uiCodec: job.codec,
		uiImageFormat: job.imageFormat,
		cancelSignal: job.cancelToken.cancelSignal,
		crf: job.crf,
		uiMuted: job.muted,
		ffmpegOverride,
		audioBitrate,
		muted: job.muted,
		enforceAudioTrack: job.enforceAudioTrack,
		proResProfile: job.proResProfile ?? undefined,
	});
	// TODO: Accept CLI options
};
