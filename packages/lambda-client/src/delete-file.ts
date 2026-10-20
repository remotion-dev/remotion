import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import {getS3Client} from './get-s3-client';
import type {ProviderSpecifics} from './provider-implementation';
import type {AwsRegion} from './regions';
import type {CustomCredentials} from './shared-constants';
import type {RequestHandler} from './types';

export const lambdaDeleteFileImplementation: ProviderSpecifics['deleteFile'] =
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
		customCredentials: CustomCredentials | null;
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
