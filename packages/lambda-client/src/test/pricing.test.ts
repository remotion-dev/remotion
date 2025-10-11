import {expect, test} from 'bun:test';
import {estimatePrice} from '../estimate-price';

test('Should calculate costs accurately', () => {
	expect(
		estimatePrice({
			region: 'us-east-1',
			durationInMiliseconds: 20000000,
			memorySizeInMb: 2048,
			diskSizeInMb: 512,
			lambdasInvoked: 1,
		}),
	).toEqual(0.53334);
	expect(
		estimatePrice({
			region: 'us-east-1',
			durationInMilliseconds: 20000000,
			memorySizeInMb: 2048,
			diskSizeInMb: 10240,
			lambdasInvoked: 1,
		}),
	).toEqual(0.53921);
	expect(
		estimatePrice({
			region: 'us-east-1',
			durationInMiliseconds: 20000000,
			memorySizeInMb: 2048,
			diskSizeInMb: 10240,
			lambdasInvoked: 1,
		}),
	).toEqual(0.53921);
});
