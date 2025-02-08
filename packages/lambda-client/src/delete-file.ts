import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import type {
	CustomCredentials,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';
import type {AwsRegion} from './regions';

export const lambdaDeleteFileImplementation: ProviderSpecifics<AwsProvider>['deleteFile'] =
	async ({
		bucketName,
		key,
		region,
		customCredentials,
		forcePathStyle,
	}: {
		region: AwsRegion;
		bucketName: string;
		key: string;
		customCredentials: CustomCredentials<AwsProvider> | null;
		forcePathStyle: boolean;
	}) => {
		await getS3Client({region, customCredentials, forcePathStyle}).send(
			new DeleteObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);
	};
