import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import type {
	CustomCredentials,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

export const lambdaDeleteFileImplementation: ProviderSpecifics<AwsProvider>['deleteFile'] =
	async ({
		bucketName,
		key,
		region,
		customCredentials,
		forcePathStyle,
		requestHandler,
	}: {
		region: AwsRegion;
		bucketName: string;
		key: string;
		customCredentials: CustomCredentials<AwsProvider> | null;
		forcePathStyle: boolean;
		requestHandler: RequestHandler | null;
	}) => {
		await getS3Client({
			region,
			customCredentials,
			forcePathStyle,
			requestHandler,
		}).send(
			new DeleteObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);
	};
