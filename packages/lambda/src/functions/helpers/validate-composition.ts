import type {
	ChromiumOptions,
	LogLevel,
	OnBrowserDownload,
	openBrowser,
	RemotionServer,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {VideoConfig} from 'remotion/no-react';
import type {Await} from '../../shared/await';
import {executablePath} from './get-chromium-executable-path';

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
	logLevel: LogLevel;
	server: RemotionServer | undefined;
	offthreadVideoCacheSizeInBytes: number | null;
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
	logLevel,
	server,
	offthreadVideoCacheSizeInBytes,
	onBrowserDownload,
	onServeUrlVisited,
}: ValidateCompositionOptions): Promise<VideoConfig> => {
	const {metadata: comp} = await RenderInternals.internalSelectComposition({
		id: composition,
		puppeteerInstance: browserInstance,
		serializedInputPropsWithCustomSchema,
		envVariables,
		timeoutInMilliseconds,
		chromiumOptions,
		port,
		browserExecutable: executablePath(),
		serveUrl,
		logLevel,
		indent: false,
		onBrowserLog: null,
		server,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory: null,
		onBrowserDownload,
		onServeUrlVisited,
	});

	return {
		...comp,
		height: forceHeight ?? comp.height,
		width: forceWidth ?? comp.width,
	};
};
