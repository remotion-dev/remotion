import type {S3Client} from '@aws-sdk/client-s3';
import {getServiceClient} from './get-service-client';
import type {AwsRegion} from './regions';
import type {CustomCredentials} from './shared-constants';
import type {RequestHandler} from './types';

export function getS3Client({
	region,
	customCredentials,
	forcePathStyle,
	requestHandler,
}: {
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}): S3Client {
	return getServiceClient({
		region: customCredentials?.region ?? region,
		service: 's3',
		customCredentials,
		forcePathStyle,
		requestHandler,
	});
}
