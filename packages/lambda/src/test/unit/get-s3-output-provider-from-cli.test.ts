import {expect, test} from 'bun:test';
import {
	getS3OutputProviderFromCli,
	makeOutNameWithCustomCredentials,
} from '../../cli/helpers/get-s3-output-provider-from-cli';

test('Should parse S3 output provider CLI flags', () => {
	expect(
		getS3OutputProviderFromCli({
			endpoint: 'https://example.com',
			accessKeyId: 'access-key',
			secretAccessKey: 'secret-key',
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
});

test('Should require an endpoint when any S3 output provider flag is passed', () => {
	expect(() =>
		getS3OutputProviderFromCli({
			endpoint: undefined,
			accessKeyId: 'access-key',
			secretAccessKey: undefined,
			region: undefined,
			forcePathStyle: undefined,
		}),
	).toThrow(
		'Pass --s3-output-provider-endpoint when using S3 output provider flags.',
	);
});

test('Should require bucket and key when using an S3 output provider', () => {
	const s3OutputProvider = getS3OutputProviderFromCli({
		endpoint: 'https://example.com',
		accessKeyId: undefined,
		secretAccessKey: undefined,
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
