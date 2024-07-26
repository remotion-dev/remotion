import type {ProviderSpecifics} from '@remotion/serverless';
import type {AwsRegion} from '../regions';
import {
	addMockBucket,
	getMockBuckets,
	getS3FilesInBucket,
	mockBucketExists,
	mockDeleteS3File,
} from './mocks/mock-store';

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
	listObjects: (input) => {
		if (!input) {
			throw new Error('need to pass input');
		}

		const files = getS3FilesInBucket({
			bucketName: input.bucketName,
			region: input.region,
		});

		return Promise.resolve(
			files
				.filter((p) => p.key.startsWith(input.prefix))
				.map((file) => {
					const size =
						typeof file.content === 'string' ? file.content.length : 0;
					return {
						Key: file.key,
						ETag: 'etag',
						LastModified: new Date(0),
						Owner: undefined,
						Size: size,
						StorageClass: undefined,
					};
				}),
		);
	},
	deleteFile: ({bucketName, key, region}) => {
		mockDeleteS3File({
			bucketName,
			key,
			region,
		});
		return Promise.resolve();
	},
	bucketExists: ({bucketName, region}) => {
		return Promise.resolve(mockBucketExists(bucketName, region));
	},
	randomHash: () => 'abcdef',
};
