import {bundle, BundlerInternals} from '@remotion/bundler';
import {
	getCompositions,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import chalk from 'chalk';
import {mkdirSync} from 'node:fs';
import path from 'path';
import {Internals} from 'remotion';
import {getCliOptions} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {handleCommonError} from './handle-common-errors';
import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {
	createProgressBar,
	makeBundlingProgress,
	makeRenderingProgress,
} from './progress-bar';
import {getUserPassedOutputLocation} from './user-passed-output-location';

export const still = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

	initializeRenderCli();

	const userOutput = path.resolve(process.cwd(), getUserPassedOutputLocation());

	const {
		inputProps,
		envVariables,
		quality,
		browser,
		imageFormat,
		stillFrame,
	} = await getCliOptions('still');

	if (imageFormat === 'none') {
		Log.error(
			'No image format was selected - this is probably an error in Remotion - please post your command on Github Issues for help.'
		);
		process.exit(1);
	}

	const browserInstance = RenderInternals.openBrowser(browser, {
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});

	mkdirSync(path.join(userOutput, '..'), {
		recursive: true,
	});

	const steps = 2;

	const shouldCache = Internals.getWebpackCaching();
	const cacheExistedBefore = BundlerInternals.cacheExists('production', null);
	if (cacheExistedBefore && !shouldCache) {
		process.stdout.write('🧹 Cache disabled but found. Deleting... ');
		await BundlerInternals.clearCache('production', null);
		process.stdout.write('done. \n');
	}

	const bundleStartTime = Date.now();
	const bundlingProgress = createProgressBar();
	const bundled = await bundle(
		fullPath,
		(progress) => {
			bundlingProgress.update(
				makeBundlingProgress({progress: progress / 100, steps, doneIn: null})
			);
		},
		{
			enableCaching: shouldCache,
		}
	);
	bundlingProgress.update(
		makeBundlingProgress({
			progress: 1,
			steps,
			doneIn: Date.now() - bundleStartTime,
		}) + '\n'
	);
	Log.verbose('Bundled under', bundled);

	const cacheExistedAfter = BundlerInternals.cacheExists('production', null);
	if (cacheExistedAfter && !cacheExistedBefore) {
		Log.info('⚡️ Cached bundle. Subsequent builds will be faster.');
	}

	const openedBrowser = await browserInstance;
	const comps = await getCompositions(bundled, {
		browser,
		inputProps,
		browserInstance: openedBrowser,
		envVariables,
	});
	const compositionId = getCompositionId(comps);

	const composition = comps.find((c) => c.id === compositionId);
	if (!composition) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	const renderProgress = createProgressBar();
	const renderStart = Date.now();

	await renderStill({
		composition,
		frame: stillFrame,
		output: userOutput,
		webpackBundle: bundled,
		quality,
		browser,
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		envVariables,
		imageFormat,
		inputProps,
		onError: (err: Error) => {
			Log.error();
			Log.error('The following error occured when rendering the still:');

			handleCommonError(err);

			process.exit(1);
		},
		puppeteerInstance: openedBrowser,
	});

	const closeBrowserPromise = openedBrowser.close();
	renderProgress.update(
		makeRenderingProgress({
			frames: 1,
			concurrency: 1,
			doneIn: Date.now() - renderStart,
			steps,
			totalFrames: 1,
		})
	);

	Log.info(chalk.green('\nYour still frame is ready!'));

	const seconds = Math.round((Date.now() - startTime) / 1000);
	Log.info(
		[
			'- Total render time:',
			seconds,
			seconds === 1 ? 'second' : 'seconds',
		].join(' ')
	);
	Log.info('-', 'Output can be found at:');
	Log.info(chalk.cyan(`▶️ ${userOutput}`));
	await closeBrowserPromise;
};
