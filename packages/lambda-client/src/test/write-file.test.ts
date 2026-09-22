import {beforeAll, expect, mock, test} from 'bun:test';
import {Readable} from 'node:stream';
import {OutputFileAccessDeniedError} from '@remotion/serverless-client';
import {lambdaHeadFileImplementation} from '../head-file';
import type {lambdaWriteFileImplementation as LambdaWriteFileImplementation} from '../write-file';

const uploadDone = mock();
const send = mock();

mock.module('@aws-sdk/lib-storage', () => ({
	Upload: class {
		done = uploadDone;
	},
}));

mock.module('../get-s3-client', () => ({
	getS3Client: () => ({
		send,
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

test('normalizes denied destination reads without masking unexpected storage failures', async () => {
	for (const status of [403, 500]) {
		const error = Object.assign(new Error('Storage request failed'), {
			$metadata: {httpStatusCode: status},
		});
		send.mockRejectedValueOnce(error);
		const result = lambdaHeadFileImplementation({
			bucketName: 'output-bucket',
			key: 'video.mp4',
			region: 'us-east-1',
			customCredentials: null,
			forcePathStyle: false,
			requestHandler: null,
		});
		if (status === 403) {
			await expect(result).rejects.toBeInstanceOf(OutputFileAccessDeniedError);
		} else {
			await expect(result).rejects.toBe(error);
		}
	}
});
