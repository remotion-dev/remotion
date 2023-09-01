import {
	DeleteBucketLifecycleCommand,
	PutBucketLifecycleConfigurationCommand,
} from '@aws-sdk/client-s3';

import {
	createLifeCycleInput,
	deleteLifeCycleInput,
} from '../functions/helpers/apply-lifecyle';
import {getLifeCycleRules} from '../functions/helpers/lifecycle';
import type {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeBucketName} from '../shared/validate-bucketname';
import {createBucket} from './create-bucket';
import {getRemotionS3Buckets} from './get-buckets';

export type GetOrCreateBucketInput = {
	region: AwsRegion;
	enableFolderExpiry?: boolean;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};
/**
 * @description Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.
 * @see [Documentation](https://remotion.dev/docs/lambda/getorcreatebucket)
 * @param params.region The region in which you want your S3 bucket to reside in.
 * @returns {Promise<GetOrCreateBucketOutput>} An object containing the `bucketName`.
 */
export const getOrCreateBucket = async (
	params: GetOrCreateBucketInput,
): Promise<GetOrCreateBucketOutput> => {
	const {remotionBuckets} = await getRemotionS3Buckets(params.region);
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.name,
			)}) in your S3 region (${
				params.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". Please see https://remotion.dev/docs/lambda/multiple-buckets.`,
		);
	}

	const {enableFolderExpiry, region} = params;
	if (remotionBuckets.length === 1) {
		const existingBucketName = remotionBuckets[0].name;
		// apply to existing bucket
		await applyLifeCyleOperation(
			enableFolderExpiry,
			existingBucketName,
			region,
		);

		return {bucketName: remotionBuckets[0].name, alreadyExisted: true};
	}

	const bucketName = makeBucketName(params.region);

	await createBucket({
		bucketName,
		region: params.region,
	});

	// apply to newly created bucket
	await applyLifeCyleOperation(enableFolderExpiry, bucketName, region);

	return {bucketName, alreadyExisted: false};
};

const createLCRules = async (bucketName: string, region: AwsRegion) => {
	const lcRules = getLifeCycleRules();
	// create the lifecyle rules
	const createCommandInput = createLifeCycleInput({
		bucketName,
		lcRules,
	});
	const createCommand = new PutBucketLifecycleConfigurationCommand(
		createCommandInput,
	);
	await getS3Client(region, null).send(createCommand);
};

async function applyLifeCyleOperation(
	enableFolderExpiry: boolean | undefined,
	bucketName: string,
	region: AwsRegion,
) {
	if (enableFolderExpiry !== undefined) {
		if (enableFolderExpiry) {
			console.log('Creating lifecycle rules!');
			await createLCRules(bucketName, region);
		} else {
			console.log('Deleting existing lifecycle rules!');
			await deleteLCRules(bucketName, region);
		}
	}
}

async function deleteLCRules(bucketName: string, region: AwsRegion) {
	const lcRules = getLifeCycleRules();
	const deleteCommandInput = deleteLifeCycleInput({
		bucketName,
		lcRules,
	});
	const deleteCommand = new DeleteBucketLifecycleCommand(deleteCommandInput);
	await getS3Client(region, null).send(deleteCommand);
}
