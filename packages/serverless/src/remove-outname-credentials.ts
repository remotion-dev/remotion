import type {
	CloudProvider,
	OutNameInput,
	OutNameInputWithoutCredentials,
} from '@remotion/serverless-client';

export const removeOutnameCredentials = <Provider extends CloudProvider>(
	outname: OutNameInput<Provider> | undefined,
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
				}
			: undefined,
	};
};
