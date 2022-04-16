import {expect, test} from 'vitest';
import {deploySite} from '../../api/deploy-site';
import {getOrCreateBucket} from '../../api/get-or-create-bucket';
import {getSites} from '../../api/get-sites';

test('Should have no buckets at first', async () => {
	expect(
		await getSites({
			region: 'us-east-1',
		})
	).toEqual({buckets: [], sites: []});
});

test('Should have a site after deploying', async () => {
	await getOrCreateBucket({
		region: 'eu-central-1',
	});
	expect(
		await deploySite({
			bucketName: 'remotionlambda-abcdef',
			entryPoint: 'first',
			region: 'eu-central-1',
			siteName: 'testing',
		})
	).toEqual({
		serveUrl:
			'https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testing/index.html',
		siteName: 'testing',
	});
	expect(await getSites({region: 'eu-central-1'})).toEqual({
		buckets: [
			{
				creationDate: 0,
				name: 'remotionlambda-abcdef',
				region: 'eu-central-1',
			},
		],
		sites: [
			{
				bucketName: 'remotionlambda-abcdef',
				id: 'testing',
				lastModified: 0,
				sizeInBytes: 48,
				serveUrl:
					'https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testing/index.html',
			},
		],
	});
});
