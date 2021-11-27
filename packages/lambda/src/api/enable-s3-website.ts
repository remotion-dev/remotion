import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';

export const enableS3Website = async ({
	region,
	bucketName,
}: {
	region: AwsRegion;
	bucketName: string;
}) => {
	await getS3Client(region).send(
		new PutBucketWebsiteCommand({
			Bucket: bucketName,
			WebsiteConfiguration: {
				// TODO Upload a demo document
				IndexDocument: {
					Suffix: 'index.html',
				},
			},
		})
	);
};
