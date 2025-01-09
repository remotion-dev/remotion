import type {ServerlessPayload} from '../constants';
import {ServerlessRoutines, overallProgressKey} from '../constants';
import {internalGetOrCreateBucket} from '../get-or-create-bucket';
import {makeInitialOverallRenderProgress} from '../overall-render-progress';
import type {
	InsideFunctionSpecifics,
	ProviderSpecifics,
} from '../provider-implementation';
import type {CloudProvider} from '../types';
import {checkVersionMismatch} from './check-version-mismatch';

type Options = {
	expectedBucketOwner: string;
	timeoutInMilliseconds: number;
	renderId: string;
};

export const startHandler = async <Provider extends CloudProvider>({
	params,
	options,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	options: Options;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics;
}) => {
	if (params.type !== ServerlessRoutines.start) {
		throw new TypeError('Expected type start');
	}

	checkVersionMismatch({
		apiName: 'renderMediaOnLambda()',
		insideFunctionSpecifics,
		params,
	});

	const region = providerSpecifics.getCurrentRegionInFunction();
	const bucketName =
		params.bucketName ??
		(
			await internalGetOrCreateBucket({
				region: providerSpecifics.getCurrentRegionInFunction(),
				enableFolderExpiry: null,
				customCredentials: null,
				providerSpecifics,
				forcePathStyle: params.forcePathStyle,
				skipPutAcl: false,
			})
		).bucketName;
	const realServeUrl = providerSpecifics.convertToServeUrl({
		urlOrId: params.serveUrl,
		region,
		bucketName,
	});

	providerSpecifics.validateDeleteAfter(params.deleteAfter);

	const initialFile = providerSpecifics.writeFile({
		bucketName,
		downloadBehavior: null,
		region,
		body: JSON.stringify(
			makeInitialOverallRenderProgress(
				options.timeoutInMilliseconds + Date.now(),
			),
		),
		expectedBucketOwner: options.expectedBucketOwner,
		key: overallProgressKey(options.renderId),
		privacy: 'private',
		customCredentials: null,
		forcePathStyle: params.forcePathStyle,
	});

	const payload: ServerlessPayload<Provider> = {
		type: ServerlessRoutines.launch,
		framesPerFunction: params.framesPerLambda,
		composition: params.composition,
		serveUrl: realServeUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId: options.renderId,
		codec: params.codec,
		imageFormat: params.imageFormat,
		crf: params.crf ?? null,
		envVariables: params.envVariables,
		pixelFormat: params.pixelFormat ?? null,
		proResProfile: params.proResProfile ?? null,
		x264Preset: params.x264Preset,
		jpegQuality: params.jpegQuality,
		maxRetries: params.maxRetries,
		privacy: params.privacy,
		logLevel: params.logLevel,
		frameRange: params.frameRange,
		outName: params.outName,
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		chromiumOptions: params.chromiumOptions,
		scale: params.scale,
		numberOfGifLoops: params.numberOfGifLoops,
		everyNthFrame: params.everyNthFrame,
		concurrencyPerFunction: params.concurrencyPerLambda,
		downloadBehavior: params.downloadBehavior,
		muted: params.muted,
		overwrite: params.overwrite,
		webhook: params.webhook,
		audioBitrate: params.audioBitrate,
		videoBitrate: params.videoBitrate,
		encodingBufferSize: params.encodingBufferSize,
		encodingMaxRate: params.encodingMaxRate,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		rendererFunctionName: params.rendererFunctionName,
		audioCodec: params.audioCodec,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		deleteAfter: params.deleteAfter,
		colorSpace: params.colorSpace,
		preferLossless: params.preferLossless,
		forcePathStyle: params.forcePathStyle,
		metadata: params.metadata,
	};

	await providerSpecifics.callFunctionAsync({
		functionName: insideFunctionSpecifics.getCurrentFunctionName(),
		type: ServerlessRoutines.launch,
		payload,
		region,
		timeoutInTest: options.timeoutInMilliseconds,
	});

	await initialFile;

	return {
		type: 'success' as const,
		bucketName,
		renderId: options.renderId,
	};
};
