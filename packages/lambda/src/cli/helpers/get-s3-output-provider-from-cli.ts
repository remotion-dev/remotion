import {
	LambdaClientInternals,
	type AwsRegion,
	type CustomCredentials,
	type OutNameInputWithKey,
} from '@remotion/lambda-client';

export const S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME =
	'REMOTION_S3_OUTPUT_PROVIDER_ACCESS_KEY_ID';
export const S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME =
	'REMOTION_S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY';

export const getS3OutputProviderFromCli = ({
	endpoint,
	region,
	forcePathStyle,
}: {
	endpoint: string | undefined;
	region: AwsRegion | (string & {}) | undefined;
	forcePathStyle: boolean | undefined;
}): CustomCredentials | null => {
	const hasAnyS3OutputProviderFlag =
		endpoint !== undefined ||
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
		accessKeyId:
			LambdaClientInternals.getEnvVariable(
				S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME,
			) ?? null,
		secretAccessKey:
			LambdaClientInternals.getEnvVariable(
				S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME,
			) ?? null,
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
	s3OutputProvider: CustomCredentials | null;
}): OutNameInputWithKey | null => {
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
