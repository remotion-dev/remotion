import {expect, test} from 'bun:test';
import {
	makeOutNameWithCustomCredentials,
	parseS3OutputProvider,
} from '../../cli/helpers/parse-s3-output-provider';

test('Should parse S3 output provider CLI JSON', () => {
	expect(
		parseS3OutputProvider(
			JSON.stringify({
				endpoint: 'https://example.com',
				accessKeyId: 'access-key',
				secretAccessKey: 'secret-key',
				region: 'auto',
				forcePathStyle: true,
			}),
		),
	).toEqual({
		endpoint: 'https://example.com',
		accessKeyId: 'access-key',
		secretAccessKey: 'secret-key',
		region: 'auto',
		forcePathStyle: true,
	});
});

test('Should reject invalid S3 output provider CLI JSON', () => {
	expect(() => parseS3OutputProvider('{')).toThrow(
		'Could not parse --s3-output-provider as JSON',
	);
	expect(() => parseS3OutputProvider('[]')).toThrow(
		'Expected --s3-output-provider to be a JSON object.',
	);
	expect(() => parseS3OutputProvider(JSON.stringify({endpoint: 12}))).toThrow(
		'Expected --s3-output-provider.endpoint to be a string, but got number.',
	);
});

test('Should require bucket and key when using an S3 output provider', () => {
	const s3OutputProvider = parseS3OutputProvider(
		JSON.stringify({endpoint: 'https://example.com'}),
	);
	if (!s3OutputProvider) {
		throw new Error('Expected S3 output provider to be parsed');
	}

	expect(() =>
		makeOutNameWithCustomCredentials({
			bucketName: undefined,
			key: 'video.mp4',
			s3OutputProvider,
		}),
	).toThrow('Pass --force-bucket-name when using --s3-output-provider.');

	expect(() =>
		makeOutNameWithCustomCredentials({
			bucketName: 'bucket',
			key: undefined,
			s3OutputProvider,
		}),
	).toThrow('Pass --out-name when using --s3-output-provider.');

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
