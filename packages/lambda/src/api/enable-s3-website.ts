import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {AwsRegion} from '..';
import {getS3Client} from '../shared/aws-clients';

export const enableS3Website = async ({
	region,
	bucketName,
}: {
	region: AwsRegion;
	bucketName: string;
}) => {
	// TODO: shouldn't we do this before
	await getS3Client(region).send(
		new PutBucketWebsiteCommand({
			Bucket: bucketName,
			WebsiteConfiguration: {
				// Upload a demo document
				IndexDocument: {
					Suffix: 'index.html',
				},
			},
		})
	);
};
