import type {VideoConfig} from 'remotion/no-react';
import type {BrowserLog} from './browser-log';
import type {Page} from './browser/BrowserPage';
import type {SourceMapGetter} from './browser/source-map-getter';
import type {Codec} from './codec';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import type {BrowserReplacer} from './replace-browser';
import {setPropsAndEnv} from './set-props-and-env';

export const makePage = async ({
	context,
	initialFrame,
	browserReplacer,
	logLevel,
	indent,
	pagesArray,
	onBrowserLog,
	scale,
	timeoutInMilliseconds,
	composition,
	proxyPort,
	serveUrl,
	muted,
	envVariables,
	serializedInputPropsWithCustomSchema,
	imageFormat,
	serializedResolvedPropsWithCustomSchema,
	pageIndex,
}: {
	context: SourceMapGetter;
	initialFrame: number;
	browserReplacer: BrowserReplacer;
	logLevel: LogLevel;
	indent: boolean;
	pagesArray: Page[];
	onBrowserLog: ((log: BrowserLog) => void) | null;
	scale: number;
	timeoutInMilliseconds: number;
	composition: Omit<VideoConfig, 'defaultProps' | 'props'>;
	proxyPort: number;
	serveUrl: string;
	muted: boolean;
	envVariables: Record<string, string>;
	serializedInputPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
	imageFormat: VideoImageFormat;
	pageIndex: number;
}) => {
	const page = await browserReplacer
		.getBrowser()
		.newPage({context, logLevel, indent, pageIndex, onBrowserLog});
	pagesArray.push(page);
	await page.setViewport({
		width: composition.width,
		height: composition.height,
		deviceScaleFactor: scale,
	});

	await setPropsAndEnv({
		serializedInputPropsWithCustomSchema,
		envVariables,
		page,
		serveUrl,
		initialFrame,
		timeoutInMilliseconds,
		proxyPort,
		retriesRemaining: 2,
		audioEnabled: !muted,
		videoEnabled: imageFormat !== 'none',
		indent,
		logLevel,
		onServeUrlVisited: () => undefined,
	});

	await puppeteerEvaluateWithCatch({
		// eslint-disable-next-line max-params
		pageFunction: (
			id: string,
			props: string,
			durationInFrames: number,
			fps: number,
			height: number,
			width: number,
			defaultCodec: Codec,
			defaultOutName: string | null,
		) => {
			window.remotion_setBundleMode({
				type: 'composition',
				compositionName: id,
				serializedResolvedPropsWithSchema: props,
				compositionDurationInFrames: durationInFrames,
				compositionFps: fps,
				compositionHeight: height,
				compositionWidth: width,
				compositionDefaultCodec: defaultCodec,
				compositionDefaultOutName: defaultOutName,
			});
		},
		args: [
			composition.id,
			serializedResolvedPropsWithCustomSchema,
			composition.durationInFrames,
			composition.fps,
			composition.height,
			composition.width,
			composition.defaultCodec,
			composition.defaultOutName,
		],
		frame: null,
		page,
		timeoutInMilliseconds,
	});

	return page;
};
