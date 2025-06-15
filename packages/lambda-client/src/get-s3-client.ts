import type {S3Client} from '@aws-sdk/client-s3';
import type {CustomCredentials} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getServiceClient} from './get-service-client';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

export const getS3Client = ({
	region,
	customCredentials,
	forcePathStyle,
	requestHandler,
}: {
	region: AwsRegion;
	customCredentials: CustomCredentials<AwsProvider> | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}): S3Client => {
	return getServiceClient({
		region: customCredentials?.region ?? region,
		service: 's3',
		customCredentials,
		forcePathStyle,
		requestHandler,
	});
};
