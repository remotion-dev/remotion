import type {Await} from '@remotion/lambda-client';
import type {
	ChromiumOptions,
	LogLevel,
	OnBrowserDownload,
	openBrowser,
	RemotionServer,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import {getChromiumPath} from './helpers/get-chromium-path';

type ValidateCompositionOptions = {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof openBrowser>>;
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string>;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	forceHeight: number | null;
	forceWidth: number | null;
	forceFps: number | null;
	forceDurationInFrames: number | null;
	logLevel: LogLevel;
	server: RemotionServer | undefined;
	offthreadVideoCacheSizeInBytes: number | null;
	mediaCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	onBrowserDownload: OnBrowserDownload;
	onServeUrlVisited: () => void;
};

export const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
	serializedInputPropsWithCustomSchema,
	envVariables,
	timeoutInMilliseconds,
	chromiumOptions,
	port,
	forceHeight,
	forceWidth,
	forceFps,
	forceDurationInFrames,
	logLevel,
	server,
	offthreadVideoCacheSizeInBytes,
	onBrowserDownload,
	onServeUrlVisited,
	offthreadVideoThreads,
	mediaCacheSizeInBytes,
}: ValidateCompositionOptions): Promise<VideoConfig> => {
	const {metadata: comp} = await RenderInternals.internalSelectComposition({
		id: composition,
		puppeteerInstance: browserInstance,
		serializedInputPropsWithCustomSchema,
		envVariables,
		timeoutInMilliseconds,
		chromiumOptions,
		port,
		browserExecutable: getChromiumPath(),
		serveUrl,
		logLevel,
		indent: false,
		onBrowserLog: null,
		server,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		binariesDirectory: null,
		onBrowserDownload,
		onServeUrlVisited,
		chromeMode: 'headless-shell',
		mediaCacheSizeInBytes,
	});

	const videoConfig: VideoConfig = {
		...comp,
		height: forceHeight ?? comp.height,
		width: forceWidth ?? comp.width,
		fps: forceFps ?? comp.fps,
		durationInFrames: forceDurationInFrames ?? comp.durationInFrames,
	};

	const reason = `of the "<Composition />" component with the id "${composition}"`;

	NoReactInternals.validateDurationInFrames(comp.durationInFrames, {
		component: reason,
		allowFloats: false,
	});
	NoReactInternals.validateFps(comp.fps, reason, false);
	NoReactInternals.validateDimension(comp.height, 'height', reason);
	NoReactInternals.validateDimension(comp.width, 'width', reason);

	return videoConfig;
};
