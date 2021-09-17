import {BucketWithLocation} from '../get-buckets';

export const mockBucketStore: BucketWithLocation[] = [];

export const addMockBucket = (bucket: BucketWithLocation) => {
	mockBucketStore.push(bucket);
};

export const getMockBuckets = () => {
	return mockBucketStore;
};
