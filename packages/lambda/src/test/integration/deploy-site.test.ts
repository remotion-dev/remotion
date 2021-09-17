import {deploySite} from '../../api/deploy-site';

jest.mock('../../api/get-buckets');
jest.mock('../../functions/helpers/io');
jest.mock('../../shared/bundle-site');
jest.mock('../../api/enable-s3-website');
jest.mock('../../api/create-bucket');
jest.mock('../../api/upload-dir');
jest.mock('../../api/bucket-exists');

test('Should throw on wrong prefix', async () => {
	await expect(() =>
		deploySite({
			bucketName: 'wrongprefix',
			entryPoint: 'hi',
			region: 'us-east-1',
		})
	).rejects.toThrow(/The bucketName parameter must start /);
});

test('Should throw if invalid region was passed', async () => {
	expect(() =>
		deploySite({
			bucketName: 'remotionlambda-testing',
			entryPoint: 'hi',
			// @ts-expect-error
			region: 'ap-northeast-9',
			siteName: 'testing',
		})
	).rejects.toThrow(/ap-northeast-9 is not a valid AWS region/);
});

test("Should throw if bucket doesn't exist", async () => {
	expect(() =>
		deploySite({
			bucketName: 'remotionlambda-non-existed',
			entryPoint: 'hi',
			region: 'ap-northeast-1',
			siteName: 'testing',
		})
	).rejects.toThrow(/o bucket with the name remotionlambda-non-existed exists/);
});
