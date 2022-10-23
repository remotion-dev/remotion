import {
	getCompositions,
	openBrowser,
	RenderInternals,
} from '@remotion/renderer';
import path from 'path';
import prompts from './composition-prompts';
// eslint-disable-next-line no-restricted-imports
import {Internals} from 'remotion';
import {selectAsync} from './composition-prompts';

import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {findRemotionRoot} from './find-closest-package-json';
import {getCliOptions, getFinalCodec} from './get-cli-options';
import {parsedCli} from './parse-command-line';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';
import type {RenderStep} from './step';
import {getUserPassedOutputLocation} from './user-passed-output-location';

export const selectComposition = async () => {
	const remotionRoot = findRemotionRoot();
	const file = parsedCli._[1];
	const downloadMap = RenderInternals.makeDownloadMap();

	const fullPath = RenderInternals.isServeUrl(file)
		? file
		: path.join(process.cwd(), file);

	const {codec} = getFinalCodec({
		downloadName: null,
		outName: getUserPassedOutputLocation(),
	});

	const {
		shouldOutputImageSequence,
		inputProps,
		envVariables,
		browserExecutable,
		browser,
		chromiumOptions,
		port,
		puppeteerTimeout,
		publicDir,
		scale,
	} = await getCliOptions({
		isLambda: false,
		type: 'series',
		codec,
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullPath) ? null : ('bundling' as const),
		'rendering' as const,
		shouldOutputImageSequence ? null : ('stitching' as const),
	].filter(Internals.truthy);

	const {urlOrBundle} = await bundleOnCliOrTakeServeUrl({
		fullPath,
		remotionRoot,
		steps,
		publicDir,
	});

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		chromiumOptions,
		forceDeviceScaleFactor: scale,
	});

	const puppeteerInstance = await browserInstance;

	const compositions = await getCompositions(urlOrBundle, {
		inputProps,
		puppeteerInstance,
		envVariables,
		timeoutInMilliseconds: puppeteerTimeout,
		chromiumOptions,
		browserExecutable,
		downloadMap,
		port,
	});

	const selectedComposition = (await selectAsync(
		{
			message: 'Select a composition:',
			optionsPerPage: 20,
			choices: compositions.map((comp) => {
				if (typeof comp.id === 'string') {
					return prompts.separator(comp.id);
				}

				return {
					value: comp.id,
					title: chalk.bold(comp.id),
				};
			}),
		},
		{}
	)) as string;

	return selectedComposition;
};
