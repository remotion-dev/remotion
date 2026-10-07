import type {
	CustomCredentials,
	OutNameInput,
	OutNameInputWithoutCredentials,
	Privacy,
} from './constants';
import type {CloudProvider} from './types';

export const getCustomOutName = <Provider extends CloudProvider>({
	outName,
	privacy,
	customCredentials,
}: {
	outName: OutNameInputWithoutCredentials | null;
	privacy: Privacy;
	customCredentials: CustomCredentials<Provider> | null;
}): OutNameInput<Provider> | null => {
	if (outName === null) {
		return null;
	}

	if (typeof outName === 'string') {
		return outName;
	}

	if (outName.s3OutputProvider) {
		if (!customCredentials && privacy === 'private') {
			throw new TypeError(
				`The file was rendered with a custom S3 implementation and is not public, but no custom credentials were passed to downloadMedia().`,
			);
		}

		return {
			bucketName: outName.bucketName,
			key: outName.key,
			s3OutputProvider: {
				endpoint: outName.s3OutputProvider.endpoint,
				accessKeyId: customCredentials?.accessKeyId ?? null,
				secretAccessKey: customCredentials?.secretAccessKey ?? null,
				region: customCredentials?.region,
				forcePathStyle: customCredentials?.forcePathStyle ?? false,
			},
		};
	}

	return {
		bucketName: outName.bucketName,
		key: outName.key,
	};
};
