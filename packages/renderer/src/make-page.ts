import type {_InternalTypes} from 'remotion';
import type {VideoConfig} from 'remotion/no-react';
import type {BrowserLog} from './browser-log';
import type {OnLog, Page} from './browser/BrowserPage';
import type {SourceMapGetter} from './browser/source-map-getter';
import type {Codec} from './codec';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import {getAvailableMemory} from './memory/get-available-memory';
import type {PixelFormat} from './pixel-format';
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
	isMainTab,
	mediaCacheSizeInBytes,
	onLog,
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
	isMainTab: boolean;
	mediaCacheSizeInBytes: number | null;
	onLog: OnLog;
}) => {
	const page = await browserReplacer
		.getBrowser()
		.newPage({context, logLevel, indent, pageIndex, onBrowserLog, onLog});
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
		isMainTab,
		mediaCacheSizeInBytes,
		initialMemoryAvailable: getAvailableMemory(logLevel),
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
			defaultVideoImageFormat: VideoImageFormat | null,
			defaultPixelFormat: PixelFormat | null,
			defaultProResProfile: _InternalTypes['ProResProfile'] | null,
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
				compositionDefaultVideoImageFormat: defaultVideoImageFormat,
				compositionDefaultPixelFormat: defaultPixelFormat,
				compositionDefaultProResProfile: defaultProResProfile,
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
			composition.defaultVideoImageFormat,
			composition.defaultPixelFormat,
			composition.defaultProResProfile,
		],
		frame: null,
		page,
		timeoutInMilliseconds,
	});

	return page;
};
