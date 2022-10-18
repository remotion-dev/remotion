import type {createBucket as original} from '../create-bucket';
import {addMockBucket} from './mock-store';

export const createBucket: typeof original = (input) => {
	addMockBucket({
		region: input.region,
		creationDate: 0,
		name: input.bucketName,
	});
	return Promise.resolve();
};
