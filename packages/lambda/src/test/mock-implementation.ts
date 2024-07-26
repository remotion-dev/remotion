import type {ProviderSpecifics} from '@remotion/serverless';
import type {AwsRegion} from '../regions';
import {addMockBucket, getMockBuckets} from './mocks/mock-store';

export const mockImplementation: ProviderSpecifics<AwsRegion> = {
	applyLifeCycle: () => Promise.resolve(),
	regionType: 'us-east-1',
	getChromiumPath() {
		return null;
	},
	getCurrentRegionInFunction: () => 'eu-central-1',
	createBucket: (input) => {
		addMockBucket({
			region: input.region,
			creationDate: 0,
			name: input.bucketName,
		});
		return Promise.resolve();
	},
	getBuckets: () => Promise.resolve(getMockBuckets()),
};
