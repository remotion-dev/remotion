import type {OutNameInput, RenderMetadata} from '../../defaults';
import type {CustomCredentials} from '../../shared/aws-clients';

export const getCustomOutName = ({
	renderMetadata,
	customCredentials,
}: {
	renderMetadata: RenderMetadata;
	customCredentials: CustomCredentials | null;
}): OutNameInput | null => {
	if (!renderMetadata.outName) {
		return null;
	}

	if (typeof renderMetadata.outName === 'string') {
		return renderMetadata.outName;
	}

	if (renderMetadata.outName.s3OutputProvider) {
		if (!customCredentials && renderMetadata.privacy === 'private') {
			throw new TypeError(
				`The file was rendered with a custom S3 implementation and is not public, but no custom credentials were passed to downloadMedia().`
			);
		}

		return {
			bucketName: renderMetadata.outName.bucketName,
			key: renderMetadata.outName.key,
			s3OutputProvider: {
				endpoint: renderMetadata.outName.s3OutputProvider.endpoint,
				accessKeyId: customCredentials?.accessKeyId ?? null,
				secretAccessKey: customCredentials?.secretAccessKey ?? null,
			},
		};
	}

	return {
		bucketName: renderMetadata.outName.bucketName,
		key: renderMetadata.outName.key,
	};
};
