import {RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {decompressInputProps} from './compress-props';
import type {ServerlessPayload} from './constants';
import {ServerlessRoutines} from './constants';
import {
	forgetBrowserEventLoop,
	getBrowserInstance,
} from './get-browser-instance';
import {internalGetOrCreateBucket} from './get-or-create-bucket';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './still';

type Options = {
	expectedBucketOwner: string;
};

export const compositionsHandler = async <Provider extends CloudProvider>(
	lambdaParams: ServerlessPayload<Provider>,
	options: Options,
	providerSpecifics: ProviderSpecifics<Provider>,
) => {
	if (lambdaParams.type !== ServerlessRoutines.compositions) {
		throw new TypeError('Expected info compositions');
	}

	if (lambdaParams.version !== VERSION) {
		if (!lambdaParams.version) {
			throw new Error(
				`Version mismatch: When calling getCompositionsOnLambda(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call getCompositionsOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`,
			);
		}

		throw new Error(
			`Version mismatch: When calling getCompositionsOnLambda(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${lambdaParams.version}. Deploy a new function and use it to call getCompositionsOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`,
		);
	}

	try {
		const region = providerSpecifics.getCurrentRegionInFunction();

		const browserInstancePromise = getBrowserInstance({
			logLevel: lambdaParams.logLevel,
			indent: false,
			chromiumOptions: lambdaParams.chromiumOptions,
			providerSpecifics,
		});
		const bucketNamePromise = lambdaParams.bucketName
			? Promise.resolve(lambdaParams.bucketName)
			: internalGetOrCreateBucket({
					region,
					enableFolderExpiry: null,
					customCredentials: null,
					providerSpecifics,
				}).then((b) => b.bucketName);

		const bucketName = await bucketNamePromise;
		const serializedInputPropsWithCustomSchema = await decompressInputProps({
			bucketName: await bucketNamePromise,
			expectedBucketOwner: options.expectedBucketOwner,
			region: providerSpecifics.getCurrentRegionInFunction(),
			serialized: lambdaParams.inputProps,
			propsType: 'input-props',
			providerSpecifics,
		});

		const realServeUrl = providerSpecifics.convertToServeUrl({
			urlOrId: lambdaParams.serveUrl,
			region,
			bucketName,
		});

		const compositions = await RenderInternals.internalGetCompositions({
			serveUrlOrWebpackUrl: realServeUrl,
			puppeteerInstance: (await browserInstancePromise).instance,
			serializedInputPropsWithCustomSchema,
			envVariables: lambdaParams.envVariables ?? {},
			timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
			chromiumOptions: lambdaParams.chromiumOptions,
			port: null,
			server: undefined,
			logLevel: lambdaParams.logLevel,
			indent: false,
			browserExecutable: null,
			onBrowserLog: null,
			offthreadVideoCacheSizeInBytes:
				lambdaParams.offthreadVideoCacheSizeInBytes,
			binariesDirectory: null,
			onBrowserDownload: () => {
				throw new Error('Should not download a browser in Lambda');
			},
		});

		return Promise.resolve({
			compositions,
			type: 'success' as const,
		});
	} finally {
		forgetBrowserEventLoop(lambdaParams.logLevel);
	}
};
