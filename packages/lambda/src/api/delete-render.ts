import type {ProviderSpecifics} from '@remotion/serverless';
import {
	getExpectedOutName,
	rendersPrefix,
	type CustomCredentials,
} from '@remotion/serverless/client';
import {awsImplementation} from '../functions/aws-implementation';
import {getOverallProgressS3} from '../functions/helpers/get-overall-progress-s3';
import type {AwsRegion} from '../regions';
import {getAccountId} from '../shared/get-account-id';
import {cleanItems} from './clean-items';

export type DeleteRenderInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	customCredentials?: CustomCredentials<AwsRegion>;
};

export const internalDeleteRender = async (
	input: DeleteRenderInput & {
		providerSpecifics: ProviderSpecifics<'aws', AwsRegion>;
	},
) => {
	const expectedBucketOwner = await getAccountId({
		region: input.region,
	});
	const progress = await getOverallProgressS3({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
		providerSpecifics: input.providerSpecifics,
	});

	// Render did not start yet
	if (progress.renderMetadata === null) {
		return {freedBytes: 0};
	}

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		progress.renderMetadata,
		input.bucketName,
		input.customCredentials ?? null,
	);

	await input.providerSpecifics.deleteFile({
		bucketName: renderBucketName,
		customCredentials,
		key,
		region: input.region,
	});

	let files = await input.providerSpecifics.listObjects({
		bucketName: input.bucketName,
		prefix: rendersPrefix(input.renderId),
		region: input.region,
		expectedBucketOwner,
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
		});
		files = await input.providerSpecifics.listObjects({
			bucketName: input.bucketName,
			prefix: rendersPrefix(input.renderId),
			region: input.region,
			expectedBucketOwner,
		});
	}

	return {
		freedBytes: totalSize,
	};
};

/**
 * @description Deletes a render artifact and it's metadata given it's renderId.
 * @see [Documentation](https://remotion.dev/docs/lambda/deleterender)
 * @param params.region The AWS region in which the media resides.
 * @param params.bucketName The `bucketName` that was specified during the render
 * @param params.renderId The `renderId` that was obtained after triggering the render.
 * @param params.customCredentials If the file was saved to a foreign cloud, pass credentials for reading from it.
 */
export const deleteRender = (input: DeleteRenderInput) => {
	return internalDeleteRender({
		...input,
		providerSpecifics: awsImplementation,
	});
};
