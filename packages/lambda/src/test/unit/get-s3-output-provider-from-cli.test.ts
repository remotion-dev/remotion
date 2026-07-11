import {expect, test} from 'bun:test';
import {
	getS3OutputProviderFromCli,
	makeOutNameWithCustomCredentials,
	S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME,
	S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME,
} from '../../cli/helpers/get-s3-output-provider-from-cli';

test('Should get S3 output provider credentials from env vars', () => {
	const previousAccessKeyId =
		process.env[S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME];
	const previousSecretAccessKey =
		process.env[S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME];

	process.env[S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME] = 'access-key';
	process.env[S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME] = 'secret-key';

	try {
		expect(
			getS3OutputProviderFromCli({
				endpoint: 'https://example.com',
				region: 'auto',
				forcePathStyle: true,
			}),
		).toEqual({
			endpoint: 'https://example.com',
			accessKeyId: 'access-key',
			secretAccessKey: 'secret-key',
			region: 'auto',
			forcePathStyle: true,
		});
	} finally {
		if (previousAccessKeyId === undefined) {
			delete process.env[S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME];
		} else {
			process.env[S3_OUTPUT_PROVIDER_ACCESS_KEY_ID_ENV_NAME] =
				previousAccessKeyId;
		}

		if (previousSecretAccessKey === undefined) {
			delete process.env[S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME];
		} else {
			process.env[S3_OUTPUT_PROVIDER_SECRET_ACCESS_KEY_ENV_NAME] =
				previousSecretAccessKey;
		}
	}
});

test('Should require an endpoint when any S3 output provider flag is passed', () => {
	expect(() =>
		getS3OutputProviderFromCli({
			endpoint: undefined,
			region: undefined,
			forcePathStyle: true,
		}),
	).toThrow(
		'Pass --s3-output-provider-endpoint when using S3 output provider flags.',
	);
});

test('Should require bucket and key when using an S3 output provider', () => {
	const s3OutputProvider = getS3OutputProviderFromCli({
		endpoint: 'https://example.com',
		region: undefined,
		forcePathStyle: undefined,
	});
	if (!s3OutputProvider) {
		throw new Error('Expected S3 output provider to be parsed');
	}

	expect(() =>
		makeOutNameWithCustomCredentials({
			bucketName: undefined,
			key: 'video.mp4',
			s3OutputProvider,
		}),
	).toThrow('Pass --force-bucket-name when using S3 output provider flags.');

	expect(() =>
		makeOutNameWithCustomCredentials({
			bucketName: 'bucket',
			key: undefined,
			s3OutputProvider,
		}),
	).toThrow('Pass --out-name when using S3 output provider flags.');

	expect(
		makeOutNameWithCustomCredentials({
			bucketName: 'bucket',
			key: 'video.mp4',
			s3OutputProvider,
		}),
	).toEqual({
		bucketName: 'bucket',
		key: 'video.mp4',
		s3OutputProvider,
	});
});
