import type {CustomCredentials, OutNameInput} from '@remotion/serverless';
import type {AwsProvider} from '../../client';

export const getS3OutputProviderFromCli = ({
	endpoint,
	accessKeyId,
	secretAccessKey,
	region,
	forcePathStyle,
}: {
	endpoint: string | undefined;
	accessKeyId: string | undefined;
	secretAccessKey: string | undefined;
	region: AwsProvider['region'] | (string & {}) | undefined;
	forcePathStyle: boolean | undefined;
}): CustomCredentials<AwsProvider> | null => {
	const hasAnyS3OutputProviderFlag =
		endpoint !== undefined ||
		accessKeyId !== undefined ||
		secretAccessKey !== undefined ||
		region !== undefined ||
		forcePathStyle !== undefined;

	if (!hasAnyS3OutputProviderFlag) {
		return null;
	}

	if (!endpoint) {
		throw new Error(
			'Pass --s3-output-provider-endpoint when using S3 output provider flags.',
		);
	}

	return {
		endpoint,
		accessKeyId: accessKeyId ?? null,
		secretAccessKey: secretAccessKey ?? null,
		region,
		forcePathStyle,
	};
};

export const makeOutNameWithCustomCredentials = ({
	bucketName,
	key,
	s3OutputProvider,
}: {
	bucketName: string | undefined;
	key: string | undefined;
	s3OutputProvider: CustomCredentials<AwsProvider> | null;
}): OutNameInput<AwsProvider> | null => {
	if (!s3OutputProvider) {
		return key ?? null;
	}

	if (!bucketName) {
		throw new Error(
			'Pass --force-bucket-name when using S3 output provider flags.',
		);
	}

	if (!key) {
		throw new Error('Pass --out-name when using S3 output provider flags.');
	}

	return {
		bucketName,
		key,
		s3OutputProvider,
	};
};
