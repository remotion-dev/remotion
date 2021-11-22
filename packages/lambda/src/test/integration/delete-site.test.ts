import {deleteSite, deploySite, getOrCreateBucket} from '../..';

test('Return 0 total size if site did not exist', async () => {
	const {bucketName} = await getOrCreateBucket({
		region: 'eu-west-1',
	});
	expect(
		await deleteSite({
			bucketName,
			region: 'eu-west-1',
			siteName: 'non existent',
		})
	).toEqual({totalSizeInBytes: 0});
});
test('Return more than 0 total size if site did not exist', async () => {
	const {bucketName} = await getOrCreateBucket({
		region: 'eu-west-1',
	});
	const {siteName} = await deploySite({
		bucketName,
		entryPoint: 'first',
		region: 'eu-west-1',
	});
	expect(
		(
			await deleteSite({
				bucketName,
				region: 'eu-west-1',
				siteName,
			})
		).totalSizeInBytes
	).toBeGreaterThan(0);
});
