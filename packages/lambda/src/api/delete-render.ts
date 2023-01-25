import type {AwsRegion} from '../client';
import {rendersPrefix} from '../defaults';
import {getExpectedOutName} from '../functions/helpers/expected-out-name';
import {getRenderMetadata} from '../functions/helpers/get-render-metadata';
import {lambdaDeleteFile, lambdaLs} from '../functions/helpers/io';
import type {CustomCredentials} from '../shared/aws-clients';
import {getAccountId} from '../shared/get-account-id';
import {cleanItems} from './clean-items';

export type DeleteRenderInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	customCredentials?: CustomCredentials;
};

/**
 * @description Deletes a render artifact and it's metadata given it's renderId.
 * @link https://remotion.dev/docs/lambda/deleterender
 * @param params.region The AWS region in which the media resides.
 * @param params.bucketName The `bucketName` that was specified during the render
 * @param params.renderId The `renderId` that was obtained after triggering the render.
 * @param params.customCredentials If the file was saved to a foreign cloud, pass credentials for reading from it.
 */
export const deleteRender = async (input: DeleteRenderInput) => {
	const expectedBucketOwner = await getAccountId({
		region: input.region,
	});
	const renderMetadata = await getRenderMetadata({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
	});

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		input.bucketName,
		input.customCredentials ?? null
	);

	await lambdaDeleteFile({
		bucketName: renderBucketName,
		customCredentials,
		key,
		region: input.region,
	});

	let files = await lambdaLs({
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
		});
		files = await lambdaLs({
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
