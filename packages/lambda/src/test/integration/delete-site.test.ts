import {deleteSite, getOrCreateBucket} from '../..';

jest.mock('../../api/get-buckets');
jest.mock('../../functions/helpers/io');
jest.mock('../../shared/bundle-site');
jest.mock('../../api/enable-s3-website');
jest.mock('../../api/create-bucket');
jest.mock('../../api/upload-dir');
jest.mock('../../api/bucket-exists');

test('Return 0 total size if site did not exist', async () => {
	const {bucketName} = await getOrCreateBucket({
		region: 'ap-east-1',
	});
	expect(
		await deleteSite({
			bucketName,
			region: 'ap-east-1',
			siteName: 'non existent',
		})
	).toEqual({totalSize: 0});
});
