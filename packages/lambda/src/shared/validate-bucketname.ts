import {REMOTION_BUCKET_PREFIX} from './constants';

export const validateBucketName = (bucketName: unknown) => {
	if (typeof bucketName !== 'string') {
		throw new TypeError(
			`'bucketName' must be a string, but is ${JSON.stringify(bucketName)}`
		);
	}

	if (!bucketName.startsWith(REMOTION_BUCKET_PREFIX)) {
		throw new Error(
			`The bucketName parameter must start with ${REMOTION_BUCKET_PREFIX}.`
		);
	}
};
