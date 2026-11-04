import type {
	OutNameInput,
	OutNameInputWithoutCredentials,
} from '@remotion/lambda-client';

export const removeOutnameCredentials = (
	outname: OutNameInput | undefined,
): OutNameInputWithoutCredentials | undefined => {
	if (outname === undefined) {
		return undefined;
	}

	if (typeof outname === 'string') {
		return outname;
	}

	return {
		bucketName: outname.bucketName,
		key: outname.key,
		s3OutputProvider: outname.s3OutputProvider
			? {
					endpoint: outname.s3OutputProvider.endpoint,
					forcePathStyle: outname.s3OutputProvider.forcePathStyle ?? false,
				}
			: undefined,
	};
};
