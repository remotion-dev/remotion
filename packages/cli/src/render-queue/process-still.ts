import {BrowserSafeApis} from '@remotion/renderer/client';
import type {JobProgressCallback, RenderJob} from '@remotion/studio-server';
import {getRendererPortFromConfigFile} from '../config/preview-server';
import {convertEntryPointToServeUrl} from '../convert-entry-point-to-serve-url';
import {getCliOptions} from '../get-cli-options';
import {parsedCli} from '../parsed-cli';
import {renderStillFlow} from '../render-flows/still';

const {publicDirOption} = BrowserSafeApis.options;

export const processStill = async ({
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
	addCleanupCallback: (label: string, cb: () => void) => void;
}) => {
	if (job.type !== 'still') {
		throw new Error('Expected still job');
	}

	const {browserExecutable} = getCliOptions({
		isStill: true,
		logLevel: job.logLevel,
		indent: true,
	});

	const publicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;

	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);

	await renderStillFlow({
		remotionRoot,
		browser: 'chrome',
		browserExecutable,
		chromiumOptions: job.chromiumOptions,
		entryPointReason: 'same as Studio',
		envVariables: job.envVariables,
		height: null,
		fullEntryPoint,
		serializedInputPropsWithCustomSchema:
			job.serializedInputPropsWithCustomSchema,
		overwrite: true,
		port: getRendererPortFromConfigFile(),
		publicDir,
		puppeteerTimeout: job.delayRenderTimeout,
		jpegQuality: job.jpegQuality,
		remainingArgs: [],
		scale: job.scale,
		stillFrame: job.frame,
		width: null,
		compositionIdFromUi: job.compositionId,
		imageFormatFromUi: job.imageFormat,
		logLevel: job.logLevel,
		onProgress,
		indent: true,
		addCleanupCallback,
		cancelSignal: job.cancelToken.cancelSignal,
		outputLocationFromUi: job.outName,
		offthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads: job.offthreadVideoThreads,
		binariesDirectory: job.binariesDirectory,
		publicPath: null,
		chromeMode: job.chromeMode,
	});
};
