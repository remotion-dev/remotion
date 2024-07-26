import {mockBucketExists} from '../../test/mocks/mock-store';
import type {bucketExistsInRegion as original} from '../bucket-exists';

export const bucketExistsInRegion: typeof original = (input) => {
	return Promise.resolve(mockBucketExists(input.bucketName, input.region));
};
