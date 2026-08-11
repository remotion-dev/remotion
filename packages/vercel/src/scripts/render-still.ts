import {statSync} from 'fs';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';

type InternalStillOptions = Parameters<
	typeof RenderInternals.internalRenderStill
>[0];

type RenderStillConfig = {
	compositionId: string;
	inputProps: Record<string, unknown>;
	output: InternalStillOptions['output'];
	serveUrl: InternalStillOptions['serveUrl'];
	frame: InternalStillOptions['frame'];
	imageFormat: InternalStillOptions['imageFormat'];
	jpegQuality: InternalStillOptions['jpegQuality'];
	envVariables: InternalStillOptions['envVariables'];
	browserExecutable: InternalStillOptions['browserExecutable'];
	chromiumOptions: InternalStillOptions['chromiumOptions'];
	scale: InternalStillOptions['scale'];
	logLevel: InternalStillOptions['logLevel'];
	timeoutInMilliseconds: InternalStillOptions['timeoutInMilliseconds'];
	binariesDirectory: InternalStillOptions['binariesDirectory'];
	chromeMode: InternalStillOptions['chromeMode'];
	offthreadVideoCacheSizeInBytes: InternalStillOptions['offthreadVideoCacheSizeInBytes'];
	mediaCacheSizeInBytes: InternalStillOptions['mediaCacheSizeInBytes'];
	offthreadVideoThreads: InternalStillOptions['offthreadVideoThreads'];
	licenseKey: InternalStillOptions['licenseKey'];
};

const config: RenderStillConfig = JSON.parse(process.argv[2]);

const noop = () => undefined;

try {
	const serializedInputProps = NoReactInternals.serializeJSONWithSpecialTypes({
		data: config.inputProps,
		indent: undefined,
		staticBase: null,
	}).serializedString;

	console.log(JSON.stringify({type: 'opening-browser'}));

	const browser = await RenderInternals.internalOpenBrowser({
		browser: 'chrome',
		browserExecutable: config.browserExecutable,
		chromiumOptions: config.chromiumOptions,
		forceDeviceScaleFactor: undefined,
		viewport: null,
		indent: false,
		logLevel: config.logLevel,
		onBrowserDownload: () => ({
			version: null,
			onProgress: noop,
		}),
		chromeMode: config.chromeMode,
	});

	console.log(JSON.stringify({type: 'selecting-composition'}));

	const {metadata: composition} =
		await RenderInternals.internalSelectComposition({
			serializedInputPropsWithCustomSchema: serializedInputProps,
			envVariables: config.envVariables,
			puppeteerInstance: browser,
			onBrowserLog: null,
			browserExecutable: config.browserExecutable,
			chromiumOptions: config.chromiumOptions,
			port: null,
			indent: false,
			server: undefined,
			serveUrl: config.serveUrl,
			id: config.compositionId,
			onServeUrlVisited: noop,
			logLevel: config.logLevel,
			timeoutInMilliseconds: config.timeoutInMilliseconds,
			binariesDirectory: config.binariesDirectory,
			onBrowserDownload: () => ({
				version: null,
				onProgress: noop,
			}),
			chromeMode: config.chromeMode,
			mediaCacheSizeInBytes: config.mediaCacheSizeInBytes,
			offthreadVideoCacheSizeInBytes: config.offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads: config.offthreadVideoThreads,
		});

	const serializedResolvedProps =
		NoReactInternals.serializeJSONWithSpecialTypes({
			data: composition.props,
			indent: undefined,
			staticBase: null,
		}).serializedString;

	const {contentType} = await RenderInternals.internalRenderStill({
		output: config.output,
		composition,
		serializedInputPropsWithCustomSchema: serializedInputProps,
		serializedResolvedPropsWithCustomSchema: serializedResolvedProps,
		serveUrl: config.serveUrl,
		frame: config.frame,
		imageFormat: config.imageFormat,
		jpegQuality: config.jpegQuality,
		envVariables: config.envVariables,
		overwrite: true,
		browserExecutable: config.browserExecutable,
		chromiumOptions: config.chromiumOptions,
		scale: config.scale,
		logLevel: config.logLevel,
		timeoutInMilliseconds: config.timeoutInMilliseconds,
		binariesDirectory: config.binariesDirectory,
		chromeMode: config.chromeMode,
		offthreadVideoCacheSizeInBytes: config.offthreadVideoCacheSizeInBytes,
		mediaCacheSizeInBytes: config.mediaCacheSizeInBytes,
		offthreadVideoThreads: config.offthreadVideoThreads,
		licenseKey: config.licenseKey,
		// Non-serializable fields with defaults
		puppeteerInstance: browser,
		onBrowserLog: null,
		onDownload: null,
		cancelSignal: null,
		indent: false,
		server: undefined,
		port: null,
		onArtifact: null,
		onLog: RenderInternals.defaultOnLog,
		isProduction: true,
		onBrowserDownload: () => ({
			version: null,
			onProgress: noop,
		}),
	});

	console.log(JSON.stringify({type: 'render-complete'}));
	await browser.close({silent: false});

	const {size} = statSync(config.output ?? '/tmp/still.png');
	console.log(JSON.stringify({type: 'done', size, contentType}));
} catch (err) {
	console.error((err as Error).message);
	process.exit(1);
}
