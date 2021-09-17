import {getSites} from '../../api/get-sites';

jest.mock('../../api/get-buckets', () => {
	const originalModule = jest.requireActual('../../api/get-buckets');
	return {
		...originalModule,
		getRemotionS3Buckets: () => {
			return {
				remotionBuckets: [],
			};
		},
	};
});

test('Should deploy if correct prefix', async () => {
	expect(
		await getSites({
			region: 'us-east-1',
		})
	).toEqual({buckets: [], sites: []});
});
