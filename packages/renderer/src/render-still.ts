import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {Browser, Internals, VideoConfig} from 'remotion';
import {openBrowser} from './open-browser';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {serveStatic} from './serve-static';
import {setPropsAndEnv} from './set-props-and-env';
import {OnErrorInfo} from './types';
import {validateFrame} from './validate-frame';

/**
 * @description Render a still frame from a composition and returns an image path
 */
export const renderStill = async ({
	config,
	compositionId,
	quality,
	imageFormat = 'png',
	webpackBundle,
	browser = Internals.DEFAULT_BROWSER,
	puppeteerInstance,
	dumpBrowserLogs = false,
	onError,
	inputProps,
	envVariables,
	output,
	frame = 0,
}: {
	config: VideoConfig;
	compositionId: string;
	quality?: number;
	imageFormat?: 'png' | 'jpeg';
	browser?: Browser;
	puppeteerInstance?: PuppeteerBrowser;
	webpackBundle: string;
	dumpBrowserLogs?: boolean;
	onError?: (info: OnErrorInfo) => void;
	inputProps?: unknown;
	envVariables?: Record<string, string>;
	output: string;
	frame?: number;
}) => {
	Internals.validateDimension(
		config.height,
		'height',
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateDimension(
		config.width,
		'width',
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateFps(
		config.fps,
		'in the `config` object of `renderStill()`'
	);
	Internals.validateDurationInFrames(
		config.durationInFrames,
		'in the `config` object passed to `renderStill()`'
	);
	validateFrame(frame, config.durationInFrames);

	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	const [{port, close}, browserInstance] = await Promise.all([
		serveStatic(webpackBundle),
		puppeteerInstance ??
			openBrowser(browser, {
				shouldDumpIo: dumpBrowserLogs,
			}),
	]);
	const page = await browserInstance.newPage();
	page.setViewport({
		width: config.width,
		height: config.height,
		deviceScaleFactor: 1,
	});
	const errorCallback = (err: Error) => {
		onError?.({error: err, frame: null});
	};

	page.on('pageerror', errorCallback);
	await setPropsAndEnv({inputProps, envVariables, page, port});

	const site = `http://localhost:${port}/index.html?composition=${compositionId}`;
	await page.goto(site);
	try {
		await seekToFrame({frame, page});
	} catch (err) {
		if (err.message.includes('timeout') && err.message.includes('exceeded')) {
			errorCallback(
				new Error(
					'The rendering timed out. See https://www.remotion.dev/docs/timeout/ for possible reasons.'
				)
			);
		} else {
			errorCallback(err);
		}

		throw err;
	}

	await provideScreenshot({
		page,
		imageFormat,
		quality,
		options: {
			frame,
			output,
		},
	});

	page.off('pageerror', errorCallback);

	close().catch((err) => {
		console.log('Unable to close web server', err);
	});

	if (puppeteerInstance) {
		await page.close();
	} else {
		browserInstance.close().catch((err) => {
			console.log('Unable to close browser', err);
		});
	}

	return {output};
};
