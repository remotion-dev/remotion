import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless';
import type {CustomCredentials} from '../client';
import type {AwsProvider} from '../functions/aws-implementation';
import type {AwsRegion} from '../regions';
import {getS3Client} from '../shared/get-s3-client';

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
