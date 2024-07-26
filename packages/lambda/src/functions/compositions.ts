import {RenderInternals} from '@remotion/renderer';
import type {ProviderSpecifics} from '@remotion/serverless';
import {forgetBrowserEventLoop, getBrowserInstance} from '@remotion/serverless';
import type {ServerlessPayload} from '@remotion/serverless/client';
import {
	ServerlessRoutines,
	internalGetOrCreateBucket,
} from '@remotion/serverless/client';
import {VERSION} from 'remotion/version';
import type {AwsRegion} from '../regions';
import {decompressInputProps} from '../shared/compress-props';
import {convertToServeUrl} from '../shared/convert-to-serve-url';

type Options = {
	expectedBucketOwner: string;
};

export const compositionsHandler = async <Region extends string>(
	lambdaParams: ServerlessPayload<Region>,
	options: Options,
	providerSpecifics: ProviderSpecifics<Region>,
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

		const realServeUrl = convertToServeUrl({
			urlOrId: lambdaParams.serveUrl,
			region: region as AwsRegion,
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
