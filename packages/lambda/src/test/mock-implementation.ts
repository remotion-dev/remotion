import type {ProviderSpecifics} from '@remotion/serverless';
import {Readable} from 'stream';
import type {AwsRegion} from '../regions';
import {convertToServeUrlImplementation} from '../shared/convert-to-serve-url';
import {
	addMockBucket,
	getMockBuckets,
	getS3FilesInBucket,
	mockBucketExists,
	mockDeleteS3File,
	readMockS3File,
	writeMockS3File,
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
	readFile: ({bucketName, key, region}) => {
		const file = readMockS3File({region, key, bucketName});
		if (!file) {
			throw new Error(`no file ${key}`);
		}

		if (typeof file.content === 'string') {
			return Promise.resolve(Readable.from(Buffer.from(file.content)));
		}

		return Promise.resolve(file.content);
	},
	writeFile: ({body, bucketName, key, privacy, region}) => {
		writeMockS3File({
			body: body as string,
			bucketName,
			key,
			privacy,
			region,
		});
		return Promise.resolve(undefined);
	},
	headFile: ({bucketName, key, region}) => {
		const read = readMockS3File({
			bucketName,
			key,
			region,
		});
		if (!read) {
			const err = new Error('File not found');
			err.name = 'NotFound';
			throw err;
		}

		return Promise.resolve({
			ContentLength: read.content.toString().length,
			LastModified: new Date(),
		});
	},
	convertToServeUrl: convertToServeUrlImplementation,
	printLoggingHelper: () => undefined,
	getFolderFiles: () => [
		{
			filename: 'something',
			size: 0,
		},
	],
};
