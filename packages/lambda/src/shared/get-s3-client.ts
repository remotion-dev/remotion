import type {S3Client} from '@aws-sdk/client-s3';
import type {CustomCredentials} from '../client';
import type {AwsProvider} from '../functions/aws-implementation';
import type {AwsRegion} from '../regions';
import {getServiceClient} from './get-service-client';

export const getS3Client = (
	region: AwsRegion,
	customCredentials: CustomCredentials<AwsProvider> | null,
): S3Client => {
	return getServiceClient({
		region: customCredentials?.region ?? region,
		service: 's3',
		customCredentials,
	});
};
