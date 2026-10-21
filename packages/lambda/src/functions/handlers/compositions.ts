import {
	LambdaClientInternals,
	ServerlessRoutines,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import {
	forgetBrowserEventLoop,
	getBrowserInstance,
} from '../get-browser-instance';
import type {LaunchedBrowser} from '../get-browser-instance';
import {getCurrentRegionInFunction} from '../helpers/get-current-region';
import {checkVersionMismatch} from './check-version-mismatch';

type Options = {
	expectedBucketOwner: string | null;
};

export const compositionsHandler = async ({
	params,
	options,
}: {
	params: ServerlessPayload;
	options: Options;
}) => {
	if (params.type !== ServerlessRoutines.compositions) {
		throw new TypeError('Expected info compositions');
	}

	checkVersionMismatch({
		apiName: 'getCompositionsOnLambda()',
		params,
	});

	let instance: LaunchedBrowser | undefined;

	try {
		const region = getCurrentRegionInFunction();

		const browserInstancePromise = getBrowserInstance({
			logLevel: params.logLevel,
			indent: false,
			chromiumOptions: params.chromiumOptions,
		});
		const bucketName = await (params.bucketName
			? Promise.resolve(params.bucketName)
			: LambdaClientInternals.internalGetOrCreateBucket({
					region,
					enableFolderExpiry: null,
					customCredentials: null,
					forcePathStyle: params.forcePathStyle,
					skipPutAcl: false,
					requestHandler: null,
					logLevel: params.logLevel,
				}).then((b) => b.bucketName));

		const serializedInputPropsWithCustomSchema =
			await LambdaClientInternals.decompressInputProps({
				bucketName,
				expectedBucketOwner: options.expectedBucketOwner,
				region: getCurrentRegionInFunction(),
				serialized: params.inputProps,
				propsType: 'input-props',
				forcePathStyle: params.forcePathStyle,
				requestHandler: null,
			});

		const realServeUrl = LambdaClientInternals.convertToServeUrlImplementation({
			urlOrId: params.serveUrl,
			region,
			bucketName,
		});

		instance = await browserInstancePromise;
		const compositions = await RenderInternals.internalGetCompositions({
			serveUrlOrWebpackUrl: realServeUrl,
			puppeteerInstance: instance?.instance,
			serializedInputPropsWithCustomSchema,
			envVariables: params.envVariables ?? {},
			timeoutInMilliseconds: params.timeoutInMilliseconds,
			chromiumOptions: params.chromiumOptions,
			port: null,
			server: undefined,
			logLevel: params.logLevel,
			indent: false,
			browserExecutable: null,
			onBrowserLog: null,
			offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
			binariesDirectory: null,
			onBrowserDownload: () => {
				throw new Error('Should not download a browser in a function');
			},
			chromeMode: 'headless-shell',
			offthreadVideoThreads: 1,
			mediaCacheSizeInBytes: params.mediaCacheSizeInBytes,
			onLog: RenderInternals.defaultOnLog,
		});

		return Promise.resolve({
			compositions,
			type: 'success' as const,
		});
	} finally {
		if (instance) {
			forgetBrowserEventLoop({
				logLevel: params.logLevel,
				launchedBrowser: instance,
			});
		}
	}
};
