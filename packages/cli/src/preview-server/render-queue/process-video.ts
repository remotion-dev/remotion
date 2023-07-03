import {convertEntryPointToServeUrl} from '../../convert-entry-point-to-serve-url';
import {getCliOptions} from '../../get-cli-options';
import {renderVideoFlow} from '../../render-flows/render';
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
	addCleanupCallback: (cb: () => void) => void;
}) => {
	if (job.type !== 'video') {
		throw new Error('Expected video job');
	}

	const {publicDir, browserExecutable, port, browser, ffmpegOverride} =
		await getCliOptions({
			isLambda: false,
			type: 'still',
			remotionRoot,
		});

	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);
	await renderVideoFlow({
		remotionRoot,
		browser,
		browserExecutable,
		chromiumOptions: job.chromiumOptions,
		entryPointReason: 'same as Studio',
		envVariables: job.envVariables,
		height: null,
		fullEntryPoint,
		inputProps: job.inputProps,
		overwrite: true,
		port,
		publicDir,
		puppeteerTimeout: job.delayRenderTimeout,
		jpegQuality: job.jpegQuality ?? undefined,
		remainingArgs: [],
		scale: job.scale,
		width: null,
		compositionIdFromUi: job.compositionId,
		logLevel: job.verbose ? 'verbose' : 'info',
		onProgress,
		indent: true,
		concurrency: job.concurrency,
		everyNthFrame: job.everyNthFrame,
		frameRange: [job.startFrame, job.endFrame],
		quiet: false,
		shouldOutputImageSequence: false,
		addCleanupCallback,
		outputLocationFromUI: job.outName,
		uiCodec: job.codec,
		uiImageFormat: job.imageFormat,
		cancelSignal: job.cancelToken.cancelSignal,
		crf: job.crf,
		ffmpegOverride,
		audioBitrate: job.audioBitrate,
		muted: job.muted,
		enforceAudioTrack: job.enforceAudioTrack,
		proResProfile: job.proResProfile ?? undefined,
		pixelFormat: job.pixelFormat,
		videoBitrate: job.videoBitrate,
		numberOfGifLoops: job.numberOfGifLoops,
		audioCodec: job.audioCodec,
		disallowParallelEncoding: job.disallowParallelEncoding,
	});
};
