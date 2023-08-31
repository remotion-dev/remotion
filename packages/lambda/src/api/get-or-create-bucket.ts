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
	applyRenderFolderExpiry?: boolean;
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

	const {applyRenderFolderExpiry, region} = params;
	if (remotionBuckets.length === 1) {
		const existingBucketName = remotionBuckets[0].name;

		// apply to existing s3 bucket
		if (applyRenderFolderExpiry) {
			await createLCRules(existingBucketName, region);
		}

		return {bucketName: remotionBuckets[0].name, alreadyExisted: true};
	}

	const bucketName = makeBucketName(params.region);

	await createBucket({
		bucketName,
		region: params.region,
		applyRenderFolderExpiry: params.applyRenderFolderExpiry,
	});

	// apply to newly created bucket
	if (applyRenderFolderExpiry) {
		await createLCRules(bucketName, region);
	}

	return {bucketName, alreadyExisted: false};
};

const createLCRules = async (bucketName: string, region: AwsRegion) => {
	const lcRules = getLifeCycleRules();

	// assume that we have an existing lifecyle rule so we delete previous ones
	const deleteCommandInput = deleteLifeCycleInput({
		bucketName,
		lcRules,
	});
	const deleteCommand = new DeleteBucketLifecycleCommand(deleteCommandInput);

	await getS3Client(region, null).send(deleteCommand);

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
