import {HeadObjectCommand} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';

export const lambdaHeadFileImplementation: ProviderSpecifics<AwsProvider>['headFile'] =
	async ({
		bucketName,
		key,
		region,
		customCredentials,
		forcePathStyle,
	}): Promise<{
		LastModified?: Date | undefined;
		ContentLength?: number | undefined;
	}> => {
		const head = await getS3Client({
			region,
			customCredentials,
			forcePathStyle,
		}).send(
			new HeadObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);
		return head;
	};
