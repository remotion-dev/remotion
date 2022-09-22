import type {OutNameInput, RenderMetadata} from '../../defaults';
import type {CustomS3Credentials} from '../../shared/aws-clients';

export const getCustomOutName = ({
	renderMetadata,
	customCredentials,
}: {
	renderMetadata: RenderMetadata;
	customCredentials: CustomS3Credentials | null;
}): OutNameInput | null => {
	if (!renderMetadata.outName) {
		return null;
	}

	if (typeof renderMetadata.outName === 'string') {
		return renderMetadata.outName;
	}

	if (renderMetadata.outName.customS3Implementation) {
		if (!customCredentials && renderMetadata.privacy !== 'public') {
			throw new TypeError(
				`The file was rendered with a custom S3 implementation and is not public, but no custom credentials were passed to downloadMedia().`
			);
		}

		return {
			bucketName: renderMetadata.outName.bucketName,
			key: renderMetadata.outName.key,
			customS3Implementation: {
				endpoint: renderMetadata.outName.customS3Implementation.endpoint,
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
