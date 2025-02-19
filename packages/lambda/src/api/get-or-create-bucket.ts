import type {AwsProvider} from '@remotion/lambda-client';
import {LambdaClientInternals} from '@remotion/lambda-client';
import type {GetOrCreateBucketInput} from '@remotion/serverless';
import {internalGetOrCreateBucket} from '@remotion/serverless';

/*
 * @description Creates a Cloud Storage bucket for Remotion Cloud Run in your GCP project. If one already exists, it will get returned instead.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getorcreatebucket)
 */
export const getOrCreateBucket = (
	options: GetOrCreateBucketInput<AwsProvider>,
) => {
	return internalGetOrCreateBucket({
		region: options.region,
		enableFolderExpiry: options.enableFolderExpiry ?? null,
		customCredentials: options.customCredentials ?? null,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		forcePathStyle: false,
		skipPutAcl: false,
	});
};
