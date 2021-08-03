import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from './open-browser';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {serveStatic} from './serve-static';
import {setPropsAndEnv} from './set-props-and-env';

/**
 * @description Render a still frame from a composition and returns an image path
 */
export const renderStill = async ({
	composition,
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
	composition: TCompMetadata;
	output: string;
	webpackBundle: string;
	frame?: number;
	inputProps?: unknown;
	imageFormat?: 'png' | 'jpeg';
	quality?: number;
	browser?: Browser;
	puppeteerInstance?: PuppeteerBrowser;
	dumpBrowserLogs?: boolean;
	onError?: (err: Error) => void;
	envVariables?: Record<string, string>;
}) => {
	Internals.validateDimension(
		composition.height,
		'height',
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateDimension(
		composition.width,
		'width',
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateFps(
		composition.fps,
		'in the `config` object of `renderStill()`'
	);
	Internals.validateDurationInFrames(
		composition.durationInFrames,
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateImageFormat(imageFormat);
	Internals.validateFrame(frame, composition.durationInFrames);

	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	Internals.validateQuality(quality);

	const [{port, close}, browserInstance] = await Promise.all([
		serveStatic(webpackBundle),
		puppeteerInstance ??
			openBrowser(browser, {
				shouldDumpIo: dumpBrowserLogs,
			}),
	]);
	const page = await browserInstance.newPage();
	page.setViewport({
		width: composition.width,
		height: composition.height,
		deviceScaleFactor: 1,
	});
	const errorCallback = (err: Error) => {
		onError?.(err);
	};

	page.on('pageerror', errorCallback);
	await setPropsAndEnv({inputProps, envVariables, page, port});

	const site = `http://localhost:${port}/index.html?composition=${composition.id}`;
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
};
