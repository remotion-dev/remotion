import type {
	ChromiumOptions,
	LogLevel,
	OnBrowserDownload,
	openBrowser,
	RemotionServer,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	Await,
	CloudProvider,
	ProviderSpecifics,
	VideoConfig,
} from '@remotion/serverless-client';
import {
	validateDimension,
	validateDurationInFrames,
	validateFps,
} from './validate';

type ValidateCompositionOptions<Provider extends CloudProvider> = {
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
	logLevel: LogLevel;
	server: RemotionServer | undefined;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	onBrowserDownload: OnBrowserDownload;
	onServeUrlVisited: () => void;
	providerSpecifics: ProviderSpecifics<Provider>;
};

export const validateComposition = async <Provider extends CloudProvider>({
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
	logLevel,
	server,
	offthreadVideoCacheSizeInBytes,
	onBrowserDownload,
	onServeUrlVisited,
	providerSpecifics,
	offthreadVideoThreads,
}: ValidateCompositionOptions<Provider>): Promise<VideoConfig> => {
	const {metadata: comp} = await RenderInternals.internalSelectComposition({
		id: composition,
		puppeteerInstance: browserInstance,
		serializedInputPropsWithCustomSchema,
		envVariables,
		timeoutInMilliseconds,
		chromiumOptions,
		port,
		browserExecutable: providerSpecifics.getChromiumPath(),
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
	});

	const videoConfig: VideoConfig = {
		...comp,
		height: forceHeight ?? comp.height,
		width: forceWidth ?? comp.width,
	};

	const reason = `of the "<Composition />" component with the id "${composition}"`;

	validateDurationInFrames(comp.durationInFrames, {
		component: reason,
		allowFloats: false,
	});
	validateFps(comp.fps, reason, false);
	validateDimension(comp.height, 'height', reason);
	validateDimension(comp.width, 'width', reason);

	return videoConfig;
};
