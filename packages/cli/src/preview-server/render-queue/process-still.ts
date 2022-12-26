import {
	getCompositions,
	openBrowser,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {ConfigInternals} from '../../config';
import {getCliOptions} from '../../get-cli-options';
import {bundleOnCli} from '../../setup-cache';
import type {RenderJob} from './job';

export const processStill = async ({
	job,
	remotionRoot,
	entryPoint,
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
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
		scale,
		browser,
		puppeteerTimeout,
	} = await getCliOptions({
		isLambda: false,
		type: 'get-compositions',
		remotionRoot,
	});

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		chromiumOptions,
		shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		forceDeviceScaleFactor: scale,
	});

	const serveUrl = await bundleOnCli({
		fullPath: entryPoint,
		publicDir,
		remotionRoot,
		steps: ['bundling'],
	});

	const compositions = await getCompositions(serveUrl, {
		browserExecutable,
		chromiumOptions,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		inputProps,
		port,
		puppeteerInstance: await browserInstance,
		timeoutInMilliseconds: puppeteerTimeout,
	});

	const composition = compositions.find((c) => {
		return c.id === job.compositionId;
	});

	if (!composition) {
		throw new TypeError(`Composition ${job.compositionId} not found`);
	}

	await renderStill({
		composition,
		output: job.outputLocation,
		serveUrl,
		browserExecutable,
		chromiumOptions,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		scale: job.scale,
		timeoutInMilliseconds: puppeteerTimeout,
		// TODO: Write download progress to CLI
		overwrite: false,
		// TODO: Allow user to overwrite file
		port,
		inputProps,
		puppeteerInstance: await browserInstance,
		quality: job.quality ?? undefined,
		imageFormat: job.imageFormat,
		frame: job.frame,

		// TODO: Allow cancel signal
		// TODO: Accept CLI options
	});
};
