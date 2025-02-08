import type {ProviderSpecifics} from '@remotion/serverless-client';
import {
	getExpectedOutName,
	getOverallProgressFromStorage,
	rendersPrefix,
	type CustomCredentials,
} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {awsImplementation} from './aws-provider';
import {cleanItems} from './clean-items';
import {REMOTION_BUCKET_PREFIX} from './constants';
import type {AwsRegion} from './regions';

export type DeleteRenderInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	customCredentials?: CustomCredentials<AwsProvider>;
	forcePathStyle?: boolean;
};

export const internalDeleteRender = async (
	input: DeleteRenderInput & {
		providerSpecifics: ProviderSpecifics<AwsProvider>;
		forcePathStyle: boolean;
	},
) => {
	const expectedBucketOwner = await input.providerSpecifics.getAccountId({
		region: input.region,
	});
	const progress = await getOverallProgressFromStorage({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
		providerSpecifics: input.providerSpecifics,
		forcePathStyle: input.forcePathStyle,
	});

	// Render did not start yet
	if (progress.renderMetadata === null) {
		return {freedBytes: 0};
	}

	const {key, renderBucketName, customCredentials} = getExpectedOutName({
		renderMetadata: progress.renderMetadata,
		bucketName: input.bucketName,
		customCredentials: input.customCredentials ?? null,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
	});

	await input.providerSpecifics.deleteFile({
		bucketName: renderBucketName,
		customCredentials,
		key,
		region: input.region,
		forcePathStyle: input.forcePathStyle,
	});

	let files = await input.providerSpecifics.listObjects({
		bucketName: input.bucketName,
		prefix: rendersPrefix(input.renderId),
		region: input.region,
		expectedBucketOwner,
		forcePathStyle: input.forcePathStyle,
	});

	let totalSize = 0;

	while (files.length > 0) {
		totalSize += files.reduce((a, b) => {
			return a + (b.Size ?? 0);
		}, 0);
		await cleanItems({
			list: files.map((f) => f.Key as string),
			bucket: input.bucketName,
			onAfterItemDeleted: () => undefined,
			onBeforeItemDeleted: () => undefined,
			region: input.region,
			providerSpecifics: input.providerSpecifics,
			forcePathStyle: input.forcePathStyle,
		});
		files = await input.providerSpecifics.listObjects({
			bucketName: input.bucketName,
			prefix: rendersPrefix(input.renderId),
			region: input.region,
			expectedBucketOwner,
			forcePathStyle: input.forcePathStyle,
		});
	}

	return {
		freedBytes: totalSize,
	};
};

/*
 * @description Deletes a rendered video, audio or still and its associated metadata.
 * @see [Documentation](https://remotion.dev/docs/lambda/deleterender)
 */
export const deleteRender = (input: DeleteRenderInput) => {
	return internalDeleteRender({
		...input,
		providerSpecifics: awsImplementation,
		forcePathStyle: false,
	});
};
