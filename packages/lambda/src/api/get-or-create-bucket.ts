import {CreateBucketCommand, ListBucketsCommand} from '@aws-sdk/client-s3';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {randomHash} from '../shared/random-hash';

export const getOrCreateBucket = async (options: {region: AwsRegion}) => {
	const existingBuckets = await getS3Client(options.region).send(
		new ListBucketsCommand({})
	);
	const withPrefix = (existingBuckets.Buckets ?? []).filter((b) => {
		return b.Name?.startsWith(REMOTION_BUCKET_PREFIX);
	});
	if (withPrefix.length > 1) {
		throw new Error(
			`You have multiple buckets in your S3 region starting with "${REMOTION_BUCKET_PREFIX}". This is an error, please delete buckets so that you have one maximum.`
		);
	}

	if (withPrefix.length === 1) {
		return withPrefix[0].Name as string;
	}

	const bucketName = REMOTION_BUCKET_PREFIX + randomHash();

	await getS3Client(options.region).send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);

	return bucketName;
};
