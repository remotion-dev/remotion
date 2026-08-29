import fs from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import type {
	CloudProvider,
	CustomCredentials,
	DownloadBehavior,
	PostRenderData,
	Privacy,
	ProviderSpecifics,
	RenderMetadata,
	SerializedInputProps,
} from '@remotion/serverless-client';
import {inspectErrors} from '@remotion/serverless-client';
import {cleanupProps} from './cleanup-props';
import {createPostRenderData} from './create-post-render-data';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const finishRender = async <Provider extends CloudProvider>({
	expectedBucketOwner,
	renderBucketName,
	customCredentials,
	downloadBehavior,
	key,
	privacy,
	inputProps,
	serializedResolvedProps,
	renderMetadata,
	logLevel,
	overallProgress,
	startTime,
	providerSpecifics,
	insideFunctionSpecifics,
	forcePathStyle,
	storageClass,
	requestHandler,
	outputFile,
	timeToCombine,
}: {
	expectedBucketOwner: string;
	renderBucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	downloadBehavior: DownloadBehavior;
	key: string;
	privacy: Privacy;
	inputProps: SerializedInputProps;
	serializedResolvedProps: SerializedInputProps;
	renderMetadata: RenderMetadata<Provider>;
	logLevel: LogLevel;
	overallProgress: OverallProgressHelper<Provider>;
	startTime: number;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	forcePathStyle: boolean;
	storageClass: Provider['storageClass'] | null;
	requestHandler: Provider['requestHandler'] | null;
	outputFile: string;
	timeToCombine: number | null;
}): Promise<PostRenderData<Provider>> => {
	const outputSize = fs.statSync(outputFile).size;

	const writeToBucket = insideFunctionSpecifics.timer(
		`Writing to bucket (${outputSize} bytes)`,
		logLevel,
	);

	await providerSpecifics.writeFile({
		bucketName: renderBucketName,
		key,
		body: fs.createReadStream(outputFile),
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		privacy,
		expectedBucketOwner,
		downloadBehavior,
		customCredentials,
		forcePathStyle,
		storageClass,
		requestHandler,
	});

	writeToBucket.end();

	const errorExplanations = inspectErrors({
		errors: overallProgress.get().errors,
	});

	const cleanupProm = cleanupProps({
		inputProps,
		serializedResolvedProps,
		providerSpecifics,
		forcePathStyle,
		insideFunctionSpecifics,
	});

	const {url: outputUrl} = providerSpecifics.getOutputUrl({
		bucketName: renderBucketName,
		currentRegion: insideFunctionSpecifics.getCurrentRegionInFunction(),
		customCredentials,
		renderMetadata,
	});

	const postRenderData = createPostRenderData({
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		memorySizeInMb: insideFunctionSpecifics.getCurrentMemorySizeInMb(),
		renderMetadata,
		errorExplanations,
		timeToDelete: (await cleanupProm).reduce((a, b) => Math.max(a, b), 0),
		outputFile: {
			sizeInBytes: outputSize,
			url: outputUrl,
		},
		outputSize,
		timeToCombine,
		overallProgress: overallProgress.get(),
		timeToFinish: Date.now() - startTime,
		providerSpecifics,
	});

	await overallProgress.setPostRenderData(postRenderData);

	fs.unlinkSync(outputFile);
	return postRenderData;
};
