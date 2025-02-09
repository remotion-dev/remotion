import type {
	BrowserExecutable,
	ChromeMode,
	ChromiumOptions,
	HeadlessBrowser,
	LogLevel,
	OnBrowserDownload,
	RemotionServer,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import type {VideoConfig} from 'remotion';
import {Log} from './log';
import {showSingleCompositionsPicker} from './show-compositions-picker';

const getCompName = ({
	cliArgs,
	compositionIdFromUi,
}: {
	cliArgs: (string | number)[];
	compositionIdFromUi: string | null;
}): null | {
	compName: string;
	remainingArgs: (string | number)[];
	reason: string;
} => {
	if (compositionIdFromUi) {
		return {
			compName: compositionIdFromUi,
			remainingArgs: [],
			reason: 'via UI',
		};
	}

	if (cliArgs.length === 0) {
		return null;
	}

	const [compName, ...remainingArgs] = cliArgs;

	return {
		compName: String(compName),
		remainingArgs,
		reason: 'Passed as argument',
	};
};

export const getCompositionId = async ({
	args,
	compositionIdFromUi,
	serializedInputPropsWithCustomSchema,
	puppeteerInstance,
	envVariables,
	timeoutInMilliseconds,
	chromiumOptions,
	port,
	browserExecutable,
	serveUrlOrWebpackUrl,
	logLevel,
	indent,
	server,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	binariesDirectory,
	onBrowserDownload,
	chromeMode,
}: {
	args: (string | number)[];
	compositionIdFromUi: string | null;
	serializedInputPropsWithCustomSchema: string;
	puppeteerInstance: HeadlessBrowser | undefined;
	envVariables: Record<string, string>;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	browserExecutable: BrowserExecutable;
	serveUrlOrWebpackUrl: string;
	logLevel: LogLevel;
	indent: boolean;
	server: RemotionServer;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	binariesDirectory: string | null;
	onBrowserDownload: OnBrowserDownload;
	chromeMode: ChromeMode;
}): Promise<{
	compositionId: string;
	reason: string;
	config: VideoConfig;
	argsAfterComposition: (string | number)[];
}> => {
	const compNameResult = getCompName({
		cliArgs: args,
		compositionIdFromUi,
	});

	if (compNameResult) {
		const {metadata: config, propsSize} =
			await RenderInternals.internalSelectComposition({
				id: compNameResult.compName,
				serializedInputPropsWithCustomSchema,
				puppeteerInstance,
				envVariables,
				timeoutInMilliseconds,
				serveUrl: serveUrlOrWebpackUrl,
				browserExecutable,
				chromiumOptions,
				port,
				logLevel,
				server,
				indent,
				onBrowserLog: null,
				offthreadVideoCacheSizeInBytes,
				offthreadVideoThreads,
				binariesDirectory,
				onBrowserDownload,
				onServeUrlVisited: () => undefined,
				chromeMode,
			});

		if (propsSize > 10_000_000) {
			Log.warn(
				{
					indent,
					logLevel,
				},
				`The props of your composition are large (${StudioServerInternals.formatBytes(
					propsSize,
				)}). This may cause slowdown.`,
			);
		}

		if (!config) {
			throw new Error(
				`Cannot find composition with ID "${compNameResult.compName}"`,
			);
		}

		return {
			compositionId: compNameResult.compName,
			reason: compNameResult.reason,
			config,
			argsAfterComposition: compNameResult.remainingArgs,
		};
	}

	if (!process.env.CI) {
		const comps = await RenderInternals.internalGetCompositions({
			puppeteerInstance,
			envVariables,
			timeoutInMilliseconds,
			chromiumOptions,
			port,
			browserExecutable,
			logLevel,
			indent,
			server,
			serveUrlOrWebpackUrl,
			onBrowserLog: null,
			serializedInputPropsWithCustomSchema,
			offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads,
			binariesDirectory,
			onBrowserDownload,
			chromeMode,
		});
		const {compositionId, reason} = await showSingleCompositionsPicker(
			comps,
			logLevel,
		);
		if (compositionId && typeof compositionId === 'string') {
			return {
				compositionId,
				reason,
				config: comps.find((c) => c.id === compositionId) as VideoConfig,
				argsAfterComposition: args,
			};
		}
	}

	Log.error({indent: false, logLevel}, 'Composition ID not passed.');
	Log.error(
		{indent: false, logLevel},
		'Pass an extra argument <composition-id>.',
	);
	process.exit(1);
};
