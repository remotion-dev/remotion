import type {CustomCredentials, OutNameInput} from './constants';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';

export const getCustomOutName = <Provider extends CloudProvider>({
	renderMetadata,
	customCredentials,
}: {
	renderMetadata: RenderMetadata<Provider>;
	customCredentials: CustomCredentials<Provider> | null;
}): OutNameInput<Provider> | null => {
	if (!renderMetadata.outName) {
		return null;
	}

	if (typeof renderMetadata.outName === 'string') {
		return renderMetadata.outName;
	}

	if (renderMetadata.outName.s3OutputProvider) {
		if (!customCredentials && renderMetadata.privacy === 'private') {
			throw new TypeError(
				`The file was rendered with a custom S3 implementation and is not public, but no custom credentials were passed to downloadMedia().`,
			);
		}

		return {
			bucketName: renderMetadata.outName.bucketName,
			key: renderMetadata.outName.key,
			s3OutputProvider: {
				endpoint: renderMetadata.outName.s3OutputProvider.endpoint,
				accessKeyId: customCredentials?.accessKeyId ?? null,
				secretAccessKey: customCredentials?.secretAccessKey ?? null,
				region: customCredentials?.region,
				forcePathStyle: customCredentials?.forcePathStyle ?? false,
			},
		};
	}

	return {
		bucketName: renderMetadata.outName.bucketName,
		key: renderMetadata.outName.key,
	};
};
