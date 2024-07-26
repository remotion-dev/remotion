import type {
	CustomCredentials,
	OutNameInput,
} from '@remotion/serverless/client';
import type {RenderMetadata} from '../../defaults';

export const getCustomOutName = <Region extends string>({
	renderMetadata,
	customCredentials,
}: {
	renderMetadata: RenderMetadata;
	customCredentials: CustomCredentials<Region> | null;
}): OutNameInput<Region> | null => {
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
			},
		};
	}

	return {
		bucketName: renderMetadata.outName.bucketName,
		key: renderMetadata.outName.key,
	};
};
