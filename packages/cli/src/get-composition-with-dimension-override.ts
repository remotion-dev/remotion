import type {
	BrowserExecutable,
	ChromiumOptions,
	HeadlessBrowser,
	LogLevel,
	RemotionServer,
} from '@remotion/renderer';
import type {VideoConfig} from 'remotion';
import {getCompositionId} from './get-composition-id';

export const getCompositionWithDimensionOverride = async ({
	height,
	width,
	args,
	compositionIdFromUi,
	chromiumOptions,
	envVariables,
	port,
	puppeteerInstance,
	timeoutInMilliseconds,
	browserExecutable,
	serveUrlOrWebpackUrl,
	indent,
	serializedInputPropsWithCustomSchema,
	logLevel,
	server,
	offthreadVideoCacheSizeInBytes,
	binariesDirectory,
}: {
	height: number | null;
	width: number | null;
	args: string[];
	compositionIdFromUi: string | null;
	timeoutInMilliseconds: number;
	puppeteerInstance: HeadlessBrowser | undefined;
	envVariables: Record<string, string>;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	browserExecutable: BrowserExecutable | null;
	serveUrlOrWebpackUrl: string;
	indent: boolean;
	logLevel: LogLevel;
	serializedInputPropsWithCustomSchema: string;
	server: RemotionServer;
	offthreadVideoCacheSizeInBytes: number | null;
	binariesDirectory: string | null;
}): Promise<{
	compositionId: string;
	reason: string;
	config: VideoConfig;
	argsAfterComposition: string[];
}> => {
	const returnValue = await getCompositionId({
		args,
		compositionIdFromUi,
		indent,
		serveUrlOrWebpackUrl,
		logLevel,
		browserExecutable,
		chromiumOptions,
		envVariables,
		serializedInputPropsWithCustomSchema,
		port,
		puppeteerInstance,
		timeoutInMilliseconds,
		server,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
	});

	return {
		...returnValue,
		config: {
			...returnValue.config,
			height: height ?? returnValue.config.height,
			width: width ?? returnValue.config.width,
		},
	};
};
