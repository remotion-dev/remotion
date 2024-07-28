import {GetBucketLocationCommand} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless';
import type {AwsRegion} from '../regions';
import {getS3Client} from '../shared/get-s3-client';

export const bucketExistsInRegionImplementation: ProviderSpecifics<
	'aws',
	AwsRegion
>['bucketExists'] = async ({bucketName, region, expectedBucketOwner}) => {
	try {
		const bucket = await getS3Client(region, null).send(
			new GetBucketLocationCommand({
				Bucket: bucketName,
				ExpectedBucketOwner: expectedBucketOwner ?? undefined,
			}),
		);

		return (bucket.LocationConstraint ?? 'us-east-1') === region;
	} catch (err) {
		if ((err as {Code: string}).Code === 'NoSuchBucket') {
			return false;
		}

		throw err;
	}
};
