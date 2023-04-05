import {convertEntryPointToServeUrl} from '../../convert-entry-point-to-serve-url';
import {getCliOptions} from '../../get-cli-options';
import {renderStillFlow} from '../../render-flows/still';
import type {JobProgressCallback, RenderJob} from './job';

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
	addCleanupCallback: (cb: () => void) => void;
}) => {
	if (job.type !== 'still') {
		throw new Error('Expected still job');
	}

	const {publicDir, browserExecutable, port, browser, puppeteerTimeout} =
		await getCliOptions({
			isLambda: false,
			type: 'still',
			remotionRoot,
		});

	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);

	await renderStillFlow({
		remotionRoot,
		browser,
		browserExecutable,
		chromiumOptions: job.chromiumOptions,
		entryPointReason: 'same as preview',
		envVariables: job.envVariables,
		height: null,
		fullEntryPoint,
		inputProps: job.inputProps as object,
		overwrite: true,
		port,
		publicDir,
		puppeteerTimeout,
		quality: job.jpegQuality ?? undefined,
		remainingArgs: [],
		scale: job.scale,
		stillFrame: job.frame,
		width: null,
		compositionIdFromUi: job.compositionId,
		imageFormatFromUi: job.imageFormat,
		logLevel: job.verbose ? 'verbose' : 'info',
		onProgress,
		indentOutput: true,
		addCleanupCallback,
		cancelSignal: job.cancelToken.cancelSignal,
	});
};
