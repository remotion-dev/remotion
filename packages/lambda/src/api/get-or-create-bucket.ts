import type {GetOrCreateBucketInput} from '@remotion/serverless/client';
import {internalGetOrCreateBucket} from '@remotion/serverless/client';
import type {AwsProvider} from '../functions/aws-implementation';
import {awsImplementation} from '../functions/aws-implementation';

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
		providerSpecifics: awsImplementation,
		forcePathStyle: false,
		skipPutAcl: false,
	});
};
