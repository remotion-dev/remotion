import {HeadObjectCommand} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless';
import type {AwsProvider} from '../functions/aws-implementation';
import {getS3Client} from '../shared/get-s3-client';

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
