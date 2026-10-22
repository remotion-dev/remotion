import {
	LambdaClientInternals,
	type GetOrCreateBucketInput,
} from '@remotion/lambda-client';

/*
 * @description Creates a Cloud Storage bucket for Remotion Cloud Run in your GCP project. If one already exists, it will get returned instead.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getorcreatebucket)
 */
export const getOrCreateBucket = (options: GetOrCreateBucketInput) => {
	return LambdaClientInternals.internalGetOrCreateBucket({
		region: options.region,
		enableFolderExpiry: options.enableFolderExpiry ?? null,
		customCredentials: options.customCredentials ?? null,
		forcePathStyle: false,
		skipPutAcl: false,
		requestHandler: options.requestHandler ?? null,
		logLevel: options.logLevel ?? 'info',
	});
};
