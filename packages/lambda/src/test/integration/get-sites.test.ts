import {deploySite} from '../..';
import {getSites} from '../../api/get-sites';

jest.mock('../../api/get-buckets');
jest.mock('../../api/deploy-site');
jest.mock('../../functions/helpers/io');

test('Should have no buckets at first', async () => {
	expect(
		await getSites({
			region: 'us-east-1',
		})
	).toEqual({buckets: [], sites: []});
});

test('Should have a site after deploying', async () => {
	expect(
		await deploySite({
			bucketName: 'remotionlambda-test',
			entryPoint: './src/index.tsx',
			region: 'eu-central-1',
			siteName: 'testing',
		})
	).toEqual({
		url: 'https://remotionlambda-test.s3.eu-central-1.amazonaws.com/testing',
	});
	expect(await getSites({region: 'eu-central-1'})).toEqual({
		buckets: [
			{
				CreationDate: new Date(0),
				Name: 'remotionlambda-test',
				region: 'eu-central-1',
			},
		],
		sites: [],
	});
});
