import type {GetOrCreateBucketInput} from '@remotion/serverless/client';
import {internalGetOrCreateBucket} from '@remotion/serverless/client';
import type {AwsProvider} from '../functions/aws-implementation';
import {awsImplementation} from '../functions/aws-implementation';

/**
 * @description Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.
 * @see [Documentation](https://remotion.dev/docs/lambda/getorcreatebucket)
 * @param params.region The region in which you want your S3 bucket to reside in.
 * @returns {Promise<GetOrCreateBucketOutput>} An object containing the `bucketName`.
 */
export const getOrCreateBucket = (
	options: GetOrCreateBucketInput<AwsProvider>,
) => {
	return internalGetOrCreateBucket({
		region: options.region,
		enableFolderExpiry: options.enableFolderExpiry ?? null,
		customCredentials: options.customCredentials ?? null,
		providerSpecifics: awsImplementation,
		forcePathStyle: false,
	});
};
