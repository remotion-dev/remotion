import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';

export const enableS3Website = async ({
	region,
	bucketName,
}: {
	region: AwsRegion;
	bucketName: string;
}) => {
	await getS3Client(region, null).send(
		new PutBucketWebsiteCommand({
			Bucket: bucketName,
			WebsiteConfiguration: {
				IndexDocument: {
					Suffix: 'index.html',
				},
			},
		})
	);
};
