import {beforeAll, expect, mock, test} from 'bun:test';
import {Readable} from 'node:stream';
import type {lambdaWriteFileImplementation as LambdaWriteFileImplementation} from '../write-file';

const uploadDone = mock();

mock.module('@aws-sdk/lib-storage', () => ({
	Upload: class {
		done = uploadDone;
	},
}));

mock.module('../get-s3-client', () => ({
	getS3Client: () => ({
		send: mock(),
	}),
}));

let lambdaWriteFileImplementation: typeof LambdaWriteFileImplementation;

beforeAll(async () => {
	const mod = await import('../write-file');
	lambdaWriteFileImplementation = mod.lambdaWriteFileImplementation;
});

test('does not retry a failed upload with a consumed Readable', async () => {
	const originalError = new Error('The upload failed');
	uploadDone.mockRejectedValueOnce(originalError);

	let thrownError: unknown;
	try {
		await lambdaWriteFileImplementation({
			body: Readable.from(['video']),
			bucketName: 'bucket',
			customCredentials: null,
			downloadBehavior: null,
			expectedBucketOwner: null,
			forcePathStyle: false,
			key: 'video.mp4',
			privacy: 'private',
			region: 'us-east-1',
			requestHandler: null,
			retries: 1,
			storageClass: null,
		});
	} catch (err) {
		thrownError = err;
	}

	expect(thrownError).toBe(originalError);
	expect(uploadDone).toHaveBeenCalledTimes(1);
});
