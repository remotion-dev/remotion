import fs, {statSync} from 'fs';
import path from 'path';
import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	BrowserExecutable,
	Internals,
	StillImageFormat,
	TCompMetadata,
} from 'remotion';
import {ensureOutputDirectory} from './ensure-output-directory';
import {
	getServeUrlWithFallback,
	ServeUrlOrWebpackBundle,
} from './legacy-webpack-config';
import {normalizeServeUrl} from './normalize-serve-url';
import {openBrowser} from './open-browser';
import {prepareServer} from './prepare-server';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';

type InnerStillOptions = {
	composition: TCompMetadata;
	output: string;
	frame?: number;
	inputProps?: unknown;
	imageFormat?: StillImageFormat;
	quality?: number;
	puppeteerInstance?: PuppeteerBrowser;
	dumpBrowserLogs?: boolean;
	envVariables?: Record<string, string>;
	overwrite?: boolean;
	browserExecutable?: BrowserExecutable;
};

export type RenderStillOptions = InnerStillOptions & ServeUrlOrWebpackBundle;

const innerRenderStill = async ({
	composition,
	quality,
	imageFormat = 'png',
	serveUrl,
	puppeteerInstance,
	dumpBrowserLogs = false,
	onError,
	inputProps,
	envVariables,
	output,
	frame = 0,
	overwrite = true,
	browserExecutable,
}: InnerStillOptions & {
	serveUrl: string;
	onError: (err: Error) => void;
}): Promise<void> => {
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
	Internals.validateNonNullImageFormat(imageFormat);
	Internals.validateFrame(frame, composition.durationInFrames);

	if (typeof output !== 'string') {
		throw new TypeError('`output` parameter was not passed or is not a string');
	}

	output = path.resolve(process.cwd(), output);

	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	Internals.validateQuality(quality);

	if (fs.existsSync(output)) {
		if (!overwrite) {
			throw new Error(
				`Cannot render still - "overwrite" option was set to false, but the output destination ${output} already exists.`
			);
		}

		const stat = statSync(output);

		if (!stat.isFile()) {
			throw new Error(
				`The output location ${output} already exists, but is not a file, but something else (e.g. folder). Cannot save to it.`
			);
		}
	}

	ensureOutputDirectory(output);

	const browserInstance =
		puppeteerInstance ??
		(await openBrowser(Internals.DEFAULT_BROWSER, {
			browserExecutable,
			shouldDumpIo: dumpBrowserLogs,
		}));
	const page = await browserInstance.newPage();
	page.setViewport({
		width: composition.width,
		height: composition.height,
		deviceScaleFactor: 1,
	});

	const cleanup = async () => {
		page.off('pageerror', errorCallback);

		if (puppeteerInstance) {
			await page.close();
		} else {
			browserInstance.close().catch((err) => {
				console.log('Unable to close browser', err);
			});
		}
	};

	const errorCallback = (err: Error) => {
		onError(err);
		cleanup();
	};

	page.on('pageerror', errorCallback);
	const site = `${normalizeServeUrl(serveUrl)}?composition=${composition.id}`;
	await setPropsAndEnv({
		inputProps,
		envVariables,
		page,
		serveUrl,
		initialFrame: frame,
	});

	await page.goto(site);
	try {
		await seekToFrame({frame, page});
	} catch (err) {
		const error = err as Error;
		if (
			error.message.includes('timeout') &&
			error.message.includes('exceeded')
		) {
			throw new Error(
				'The rendering timed out. See https://www.remotion.dev/docs/timeout/ for possible reasons.'
			);
		}

		throw error;
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

	await cleanup();
};

/**
 * @description Render a still frame from a composition and returns an image path
 */

export const renderStill = async (
	options: RenderStillOptions
): Promise<void> => {
	const selectedServeUrl = getServeUrlWithFallback(options);

	const {closeServer, serveUrl} = await prepareServer(selectedServeUrl);

	return new Promise((resolve, reject) => {
		// eslint-disable-next-line promise/catch-or-return
		innerRenderStill({
			...options,
			serveUrl,
			onError: (err) => reject(err),
		})
			.then((res) => resolve(res))
			.catch((err) => reject(err))
			.finally(() => closeServer());
	});
};
